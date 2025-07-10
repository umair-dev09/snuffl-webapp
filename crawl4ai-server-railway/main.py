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

class ColorVariant(BaseModel):
    color_name: Optional[str] = None
    color_image_url: Optional[str] = None

class BuyingOption(BaseModel):
    seller_name: Optional[str] = None
    price: Optional[float] = None
    delivery_info: Optional[str] = None
    offers: Optional[str] = None
    site_url: Optional[str] = None

class SampleReview(BaseModel):
    rating: Optional[float] = None
    review_text: Optional[str] = None
    source: Optional[str] = None

class ProductData(BaseModel):
    title: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[float] = None
    price_range: Optional[str] = None
    image_urls: Optional[List[str]] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    colors_available: Optional[List[ColorVariant]] = None
    sizes_available: Optional[List[str]] = None
    specifications: Optional[dict] = None
    weight: Optional[str] = None
    dimensions: Optional[str] = None
    availability_text: Optional[str] = None
    buying_options: Optional[List[BuyingOption]] = None
    average_rating: Optional[float] = None
    total_reviews: Optional[int] = None
    review_tags: Optional[List[str]] = None
    sample_reviews: Optional[List[SampleReview]] = None

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
        # Configure browser settings for maximum speed
        browser_config = BrowserConfig(
            browser_type="chromium",
            headless=True,
            verbose=False
        )
        
        # Configure crawl settings for speed optimization
        crawl_config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            word_count_threshold=5,  # Reduced from 10
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
        # Configure browser settings for maximum speed
        browser_config = BrowserConfig(
            browser_type="chromium",
            headless=True,
            verbose=False
        )
        
        # Configure crawl settings for speed optimization
        crawl_config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            word_count_threshold=5,  # Reduced from 10
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

@app.post("/scrape-google-shopping", response_model=ScrapeResponse)
async def scrape_google_shopping_comprehensive(request: ScrapeRequest):
    """Scrape Google Shopping page comprehensively by checking multiple page variants"""
    try:
        # Configure browser settings for maximum speed
        browser_config = BrowserConfig(
            browser_type="chromium",
            headless=True,
            verbose=False
        )
        
        # Configure crawl settings for comprehensive data extraction
        crawl_config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            word_count_threshold=10,  # Increased for more content
            remove_overlay_elements=True,
            wait_for_images=True,     # Enable image waiting for better extraction
            process_iframes=False
        )
        
        # Prepare multiple URLs to scrape for comprehensive data
        base_url = request.url
        urls_to_scrape = [base_url]
        
        # Add additional Google Shopping URLs if it's a Google Shopping page
        if "google.com/shopping/product" in base_url:
            # Extract product ID and base URL parts
            if "?gl=" in base_url:
                base_part = base_url.split("?gl=")[0]
                gl_part = "?gl=" + base_url.split("?gl=")[1]
                
                # Add offers, specs, and reviews URLs
                urls_to_scrape.extend([
                    f"{base_part}/offers{gl_part}",
                    f"{base_part}/specs{gl_part}",
                    f"{base_part}/reviews{gl_part}"
                ])
        
        # Scrape all URLs
        async with AsyncWebCrawler(config=browser_config) as crawler:
            results = await crawler.arun_many(urls=urls_to_scrape, config=crawl_config)
        
        # Combine all content for comprehensive extraction
        combined_content = ""
        for i, result in enumerate(results):
            if result.success and result.markdown:
                section_label = ["MAIN", "OFFERS", "SPECS", "REVIEWS"][i] if i < 4 else f"SECTION_{i}"
                combined_content += f"\n\n=== {section_label} PAGE ===\n{result.markdown}"
        
        if not combined_content:
            return ScrapeResponse(
                url=request.url,
                success=False,
                error="Failed to crawl any of the page variants"
            )
        
        product_data = None
        if request.extract_structured_data:
            # Use Groq to extract comprehensive product data
            product_data = await extract_comprehensive_product_data_with_groq(combined_content)
        
        return ScrapeResponse(
            url=request.url,
            success=True,
            product_data=product_data,
            raw_content=combined_content[:1500] if combined_content else None
        )
        
    except Exception as e:
        return ScrapeResponse(
            url=request.url,
            success=False,
            error=str(e)
        )

async def extract_product_data_with_groq(content: str) -> ProductData:
    """Extract structured product data using Groq's Llama model - Optimized for Google Shopping pages"""
    try:
        # Truncate content but keep more for comprehensive extraction
        truncated_content = content[:4000]  # Increased from 2000 for more data
        
        prompt = f"""
        You are a GOOGLE SHOPPING page parser. Extract ALL product information from this Google Shopping page into the exact JSON format below.

        IMPORTANT: Return ONLY valid JSON, no extra text or explanations.

        GOOGLE SHOPPING PAGE STRUCTURE GUIDE:
        - Product title: Usually in h1 or main heading
        - Brand: Often separate from title or in title
        - Price: Look for currency symbols (₹, $) and numbers
        - Price range: If shows range like "₹2,000–₹2,599"
        - Images: CRITICAL - Extract ALL image URLs including:
          * Main product image (usually largest)
          * Carousel images in sh-div__image div
          * Thumbnail images
          * Color variant images
          * Google Shopping encrypted image URLs (like encrypted-tbn1.gstatic.com/shopping?q=tbn:...)
          * Any src, data-src, or background-image URLs
        - Description: Main product description paragraphs
        - Features: Bullet points about product features
        - Colors: Color variants with names and images
        - Sizes: Size options for fashion/wearable items
        - Specifications: Technical specs like battery, dimensions, etc.
        - Buying options: Different sellers with prices and delivery info
        - Reviews: Rating, review count, review tags, sample reviews
        - Availability: Stock status and delivery information

        REQUIRED JSON FORMAT:
        {{
            "title": "full product title",
            "brand": "brand name",
            "price": numeric_price_value,
            "price_range": "price range if shown",
            "image_urls": ["image1.jpg", "image2.jpg"],
            "description": "main product description",
            "features": ["feature1", "feature2"],
            "colors_available": [
                {{"color_name": "color", "color_image_url": "image_url"}}
            ],
            "sizes_available": ["size1", "size2"],
            "specifications": {{
                "battery": "value",
                "form_factor": "value",
                "dimensions": "value"
            }},
            "weight": "weight if mentioned",
            "dimensions": "dimensions if available",
            "availability_text": "delivery/stock text",
            "buying_options": [
                {{
                    "seller_name": "seller name",
                    "price": numeric_price,
                    "delivery_info": "delivery text",
                    "offers": "offer text",
                    "site_url": "visit site url"
                }}
            ],
            "average_rating": numeric_rating,
            "total_reviews": numeric_count,
            "review_tags": ["tag1", "tag2"],
            "sample_reviews": [
                {{
                    "rating": numeric_rating,
                    "review_text": "review text",
                    "source": "source site"
                }}
            ]
        }}

        EXTRACTION RULES:
        1. Extract ALL available data, use null for missing fields
        2. Convert all prices to numbers (remove currency symbols)
        3. Extract ALL image URLs from carousels and thumbnails INCLUDING:
           - Main product images
           - Carousel/thumbnail images in sh-div__image divs
           - Color variant images
           - Google Shopping encrypted URLs (encrypted-tbn1.gstatic.com/shopping?q=tbn:...)
           - Any image URLs in src, data-src, or style attributes
        4. Get ALL buying options with seller details
        5. Extract ALL product features as separate array items
        6. Parse specifications into structured object
        7. Get sample reviews with ratings and sources
        8. Use exact field names as specified above

        GOOGLE SHOPPING PAGE CONTENT:
        {truncated_content}
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,    # Increased for comprehensive data
            temperature=0,      # Keep deterministic
            top_p=0.1          # For focused extraction
        )
        
        # Parse the JSON response
        extracted_text = response.choices[0].message.content.strip()
        
        # Try to find JSON in the response
        start_idx = extracted_text.find('{')
        end_idx = extracted_text.rfind('}') + 1
        
        if start_idx != -1 and end_idx != -1:
            json_str = extracted_text[start_idx:end_idx]
            try:
                product_dict = json.loads(json_str)
                return ProductData(**product_dict)
            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {e}")
                print(f"Raw response: {extracted_text}")
                return ProductData()
        else:
            print(f"No JSON found in response: {extracted_text}")
            return ProductData()
            
    except Exception as e:
        print(f"Error extracting product data: {e}")
        return ProductData()

async def extract_comprehensive_product_data_with_groq(content: str) -> ProductData:
    """Extract comprehensive product data from multiple Google Shopping page sections"""
    try:
        # Keep more content for comprehensive extraction
        truncated_content = content[:8000]  # Increased for multi-page content
        
        prompt = f"""
        You are parsing MULTIPLE SECTIONS of a Google Shopping page (MAIN, OFFERS, SPECS, REVIEWS). 
        Extract ALL available product information into the exact JSON format below.

        RETURN ONLY VALID JSON, NO EXTRA TEXT.

        GOOGLE SHOPPING SECTIONS EXPLAINED:
        - MAIN PAGE: Product title, brand, main price, images (including encrypted Google Shopping URLs), description, features, colors, availability
        - OFFERS PAGE: All buying options with different sellers, prices, delivery info, offers
        - SPECS PAGE: Detailed technical specifications, dimensions, weight, features
        - REVIEWS PAGE: Ratings, review count, review tags, sample reviews with sources

        EXTRACTION INSTRUCTIONS:
        1. MAIN PAGE: Extract title, brand, primary price, ALL image URLs from carousels and thumbnails
        2. OFFERS PAGE: Extract ALL buying options with seller details
        3. SPECS PAGE: Extract ALL specifications into structured object
        4. REVIEWS PAGE: Extract rating, review count, tags, sample reviews
        5. Combine all information into single comprehensive JSON

        IMAGE EXTRACTION PRIORITY:
        - Extract ALL Google Shopping encrypted image URLs (encrypted-tbn1.gstatic.com/shopping?q=tbn:...)
        - Extract images from sh-div__image divs and carousels
        - Extract color variant images
        - Extract any src, data-src, or background-image URLs
        - Include both main product images and thumbnail images

        REQUIRED JSON FORMAT (use null for missing data):
        {{
            "title": "complete product title",
            "brand": "brand name",
            "price": lowest_price_as_number,
            "price_range": "price range if shown (e.g., ₹2,000–₹2,599)",
            "image_urls": ["all_product_images_from_carousel"],
            "description": "main product description",
            "features": ["feature1", "feature2", "feature3"],
            "colors_available": [
                {{"color_name": "color", "color_image_url": "image_url"}}
            ],
            "sizes_available": ["size1", "size2"],
            "specifications": {{
                "battery": "value",
                "form_factor": "value",
                "dimensions": "value",
                "weight": "value",
                "connectivity": "value",
                "compatibility": "value"
            }},
            "weight": "weight if mentioned separately",
            "dimensions": "dimensions if mentioned separately",
            "availability_text": "delivery/stock status text",
            "buying_options": [
                {{
                    "seller_name": "Amazon/Flipkart/Croma/etc",
                    "price": numeric_price,
                    "delivery_info": "delivery text",
                    "offers": "offer/discount text",
                    "site_url": "visit site url"
                }}
            ],
            "average_rating": numeric_rating,
            "total_reviews": numeric_count,
            "review_tags": ["Good sound", "Comfortable", "Bass"],
            "sample_reviews": [
                {{
                    "rating": numeric_rating,
                    "review_text": "actual review text",
                    "source": "Amazon/Flipkart/etc"
                }}
            ]
        }}

        CRITICAL EXTRACTION RULES:
        1. Extract ALL image URLs from image carousels and thumbnails INCLUDING:
           - Main product images
           - Google Shopping encrypted URLs (encrypted-tbn1.gstatic.com/shopping?q=tbn:...)
           - Images in sh-div__image divs
           - Color variant images
           - Any image URLs in src, data-src, or style attributes
        2. Get ALL buying options from OFFERS section
        3. Parse ALL specifications from SPECS section
        4. Extract sample reviews with ratings and sources from REVIEWS section
        5. Convert all prices to numbers (remove currency symbols)
        6. Use exact field names as specified above
        7. Return null for truly missing data, not empty strings

        COMBINED GOOGLE SHOPPING PAGE CONTENT:
        {truncated_content}
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2500,    # Increased for comprehensive data
            temperature=0,      # Keep deterministic
            top_p=0.1          # For focused extraction
        )
        
        # Parse the JSON response
        extracted_text = response.choices[0].message.content.strip()
        
        # Try to find JSON in the response
        start_idx = extracted_text.find('{')
        end_idx = extracted_text.rfind('}') + 1
        
        if start_idx != -1 and end_idx != -1:
            json_str = extracted_text[start_idx:end_idx]
            try:
                product_dict = json.loads(json_str)
                return ProductData(**product_dict)
            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {e}")
                print(f"Raw response: {extracted_text}")
                return ProductData()
        else:
            print(f"No JSON found in response: {extracted_text}")
            return ProductData()
            
    except Exception as e:
        print(f"Error extracting comprehensive product data: {e}")
        return ProductData()

@app.get("/")
async def root():
    return {
        "message": "Snuffl Crawl4AI Server (Railway) - Enhanced for Google Shopping",
        "platform": "Railway",
        "endpoints": {
            "/health": "Health check",
            "/scrape": "Scrape single product page (basic)",
            "/scrape-google-shopping": "Comprehensive Google Shopping page scraping",
            "/bulk-scrape": "Scrape multiple product pages",
            "/docs": "API documentation"
        },
        "features": [
            "Comprehensive Google Shopping data extraction",
            "Multi-section scraping (main, offers, specs, reviews)",
            "Enhanced product data model with 20+ fields",
            "Optimized for speed and accuracy"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
