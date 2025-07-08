from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from crawl4ai import WebCrawler
from groq import Groq
import os
import json
import asyncio
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Snuffl Crawl4AI Server", version="1.0.0")

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
    return {"status": "healthy", "service": "Snuffl Crawl4AI Server"}

@app.post("/scrape", response_model=ScrapeResponse)
async def scrape_single_page(request: ScrapeRequest):
    """Scrape a single product page and extract structured data"""
    try:
        # Initialize crawler
        crawler = WebCrawler()
        
        # Crawl the page
        result = crawler.run(url=request.url)
        
        if not result.success:
            return ScrapeResponse(
                url=request.url,
                success=False,
                error="Failed to crawl the page"
            )
        
        product_data = None
        if request.extract_structured_data:
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
    """Scrape multiple product pages in parallel"""
    try:
        # Limit concurrent requests to avoid overwhelming the server
        semaphore = asyncio.Semaphore(5)
        
        async def scrape_with_semaphore(url: str):
            async with semaphore:
                scrape_request = ScrapeRequest(url=url, extract_structured_data=request.extract_structured_data)
                return await scrape_single_page(scrape_request)
        
        # Execute all scraping tasks concurrently
        tasks = [scrape_with_semaphore(url) for url in request.urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle any exceptions that occurred
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                processed_results.append(ScrapeResponse(
                    url=request.urls[i],
                    success=False,
                    error=str(result)
                ))
            else:
                processed_results.append(result)
        
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
        "message": "Snuffl Crawl4AI Server",
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
