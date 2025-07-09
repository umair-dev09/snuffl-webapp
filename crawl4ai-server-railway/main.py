from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
from groq import Groq
import os
import json
import asyncio
from typing import List, Optional
from dotenv import load_dotenv
from install_playwright import ensure_playwright_installed

load_dotenv()

# Ensure Playwright is installed on startup
print("🔧 Checking Playwright installation...")
playwright_ready = ensure_playwright_installed()
if not playwright_ready:
    print("❌ Warning: Playwright installation failed. Browser functionality may not work.")

app = FastAPI(title="Snuffl Crawl4AI Server (Railway)", version="1.0.0")

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Request/Response models
class ScrapeRequest(BaseModel):
    url: str
    extract_structured_data: bool = True

class BulkScrapeRequest(BaseModel):
    urls: List[str]
    extract_structured_data: bool = True

class ProductData(BaseModel):
    name: Optional[str] = None
    price: Optional[str] = None
    original_price: Optional[str] = None
    discount: Optional[str] = None
    rating: Optional[float] = None
    rating_count: Optional[int] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    brand: Optional[str] = None
    availability: Optional[str] = None
    specifications: Optional[dict] = None

class ScrapeResponse(BaseModel):
    url: str
    success: bool
    product_data: Optional[ProductData] = None
    raw_content: Optional[str] = None
    error: Optional[str] = None

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Snuffl Crawl4AI Server (Railway)", "platform": "Railway"}

@app.post("/scrape", response_model=ScrapeResponse)
async def scrape_single_page(request: ScrapeRequest):
    """Scrape a single product page and extract structured data"""
    try:
        # Configure browser settings
        browser_config = BrowserConfig(
            browser_type="chromium",
            headless=True,
            verbose=False
        )
        
        # Configure crawl settings
        crawl_config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            word_count_threshold=10,
            remove_overlay_elements=True,
            wait_for_images=False,
            process_iframes=False
        )
        
        # Use async context manager for proper resource management
        async with AsyncWebCrawler(config=browser_config) as crawler:
            result = await crawler.arun(url=request.url, config=crawl_config)
        
        if not result.success:
            return ScrapeResponse(
                url=request.url,
                success=False,
                error=result.error_message or "Failed to crawl the page"
            )
        
        product_data = None
        if request.extract_structured_data and result.markdown:
            # Use Groq to extract structured product data
            product_data = await extract_product_data_with_groq(result.markdown)
        
        return ScrapeResponse(
            url=request.url,
            success=True,
            product_data=product_data,
            raw_content=result.markdown[:1000] if result.markdown else None  # Truncate for response size
        )
        
    except Exception as e:
        return ScrapeResponse(
            url=request.url,
            success=False,
            error=str(e)
        )

@app.post("/bulk-scrape")
async def scrape_multiple_pages(request: BulkScrapeRequest):
    """Scrape multiple product pages using arun_many for optimal performance"""
    try:
        # Configure browser settings
        browser_config = BrowserConfig(
            browser_type="chromium",
            headless=True,
            verbose=False
        )
        
        # Configure crawl settings
        crawl_config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            word_count_threshold=10,
            remove_overlay_elements=True,
            wait_for_images=False,
            process_iframes=False
        )
        
        # Use async context manager and arun_many for efficient bulk crawling
        async with AsyncWebCrawler(config=browser_config) as crawler:
            results = await crawler.arun_many(urls=request.urls, config=crawl_config)
        
        # Process results and extract product data if requested
        processed_results = []
        for i, result in enumerate(results):
            url = request.urls[i]
            
            if result.success:
                product_data = None
                if request.extract_structured_data and result.markdown:
                    # Use Groq to extract structured product data
                    product_data = await extract_product_data_with_groq(result.markdown)
                
                processed_results.append(ScrapeResponse(
                    url=url,
                    success=True,
                    product_data=product_data,
                    raw_content=result.markdown[:1000] if result.markdown else None
                ))
            else:
                processed_results.append(ScrapeResponse(
                    url=url,
                    success=False,
                    error=result.error_message or "Failed to crawl the page"
                ))
        
        successful_scrapes = sum(1 for r in processed_results if r.success)
        
        return {
            "total_urls": len(request.urls),
            "successful_scrapes": successful_scrapes,
            "failed_scrapes": len(request.urls) - successful_scrapes,
            "results": processed_results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def extract_product_data_with_groq(content: str) -> ProductData:
    """Extract structured product data using Groq's Llama model"""
    try:
        prompt = f"""
        Extract product information from the following e-commerce page content and return ONLY a valid JSON object with these exact fields:

        {{
            "name": "product name",
            "price": "current price with currency symbol",
            "original_price": "original price if there's a discount",
            "discount": "discount percentage or amount",
            "rating": "rating as number (e.g., 4.5)",
            "rating_count": "number of ratings as integer",
            "image_url": "main product image URL",
            "description": "brief product description",
            "brand": "brand name",
            "availability": "in stock/out of stock status",
            "specifications": {{"key": "value"}}
        }}

        Rules:
        - Return ONLY the JSON object, no additional text
        - Use null for missing information
        - Extract price as string with currency symbol (₹, $, etc.)
        - Rating should be a number between 0-5
        - Keep description under 200 characters
        - For specifications, include key technical details as key-value pairs

        Content to extract from:
        {content[:3000]}
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{
                "role": "user",
                "content": prompt
            }],
            max_tokens=800,
            temperature=0.1
        )
        
        # Parse the JSON response
        extracted_text = response.choices[0].message.content.strip()
        
        # Try to find JSON in the response
        start_idx = extracted_text.find('{')
        end_idx = extracted_text.rfind('}') + 1
        
        if start_idx != -1 and end_idx != -1:
            json_str = extracted_text[start_idx:end_idx]
            product_dict = json.loads(json_str)
            return ProductData(**product_dict)
        else:
            # Fallback: return empty ProductData if JSON parsing fails
            return ProductData()
            
    except Exception as e:
        print(f"Error extracting product data: {e}")
        # Return empty ProductData on error
        return ProductData()

@app.get("/")
async def root():
    return {
        "message": "Snuffl Crawl4AI Server (Railway)",
        "platform": "Railway",
        "endpoints": {
            "/health": "Health check",
            "/scrape": "Scrape single product page",
            "/bulk-scrape": "Scrape multiple product pages",
            "/docs": "API documentation"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
