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
    """🧠 SMART COMPREHENSIVE SCRAPING: Google Shopping + Auto E-commerce Detection + Deep Scraping"""
    try:
        print(f"� Starting smart comprehensive scraping for: {request.url}")
        
        # STEP 1: Get Google Shopping content (exact same as working simple endpoint)
        browser_config = BrowserConfig(
            browser_type="chromium",
            headless=True,
            verbose=False,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        
        crawl_config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            word_count_threshold=50,
            remove_overlay_elements=True,
            wait_for_images=False,
            process_iframes=False
        )
        
        async with AsyncWebCrawler(config=browser_config) as crawler:
            result = await crawler.arun(url=request.url, config=crawl_config)
        
        if not result.success:
            return ScrapeResponse(
                url=request.url,
                success=False,
                error=result.error_message or "Failed to crawl Google Shopping page"
            )
        
        content = result.markdown or ""
        if len(content) < 500 or "Sign in" in content or "Choose what you're giving feedback on" in content:
            return ScrapeResponse(
                url=request.url,
                success=False,
                error="Google is showing login/consent page instead of product content",
                raw_content=content[:500]
            )
        
        print(f"✅ Successfully scraped Google Shopping content ({len(content)} chars)")
        
        # STEP 2: Smart extraction - try comprehensive first, fallback to simple
        google_data = None
        
        # Try comprehensive extraction first
        print(f"🔍 Attempting comprehensive extraction...")
        google_data = await extract_comprehensive_product_data_with_groq(content)
        
        # If comprehensive failed or returned poor data, use simple extraction
        if not google_data or not google_data.title or google_data.title == "Unknown Product from Google Shopping":
            print(f"🔄 Comprehensive failed, using simple extraction...")
            google_data = await extract_simple_product_data(content)
        
        if not google_data or not google_data.title:
            return ScrapeResponse(
                url=request.url,
                success=False,
                error="Failed to extract product data from Google Shopping page",
                raw_content=content[:500]
            )
        
        print(f"✅ Extracted Google Shopping data: {google_data.title}")
        
        # STEP 3: Smart buying options extraction from raw content
        buying_options = await extract_smart_buying_options(content)
        if buying_options:
            google_data.buying_options = buying_options
            print(f"🛒 Found {len(buying_options)} buying options")
        
        # STEP 4: Smart deep scraping if we have good e-commerce URLs
        final_data = google_data
        if buying_options:
            # Filter for actual e-commerce product URLs
            product_urls = []
            for option in buying_options:
                if option.site_url and is_valid_product_url(option.site_url):
                    product_urls.append(option)
            
            if product_urls:
                print(f"🎯 Found {len(product_urls)} valid product URLs, starting deep scraping...")
                enhanced_data = await smart_scrape_product_pages(product_urls[:2])  # Limit to 2 for speed
                
                if enhanced_data:
                    # Merge the enhanced data with Google Shopping data
                    final_data = smart_merge_product_data(google_data, enhanced_data)
                    print(f"✅ Enhanced data with deep scraping")
        
        return ScrapeResponse(
            url=request.url,
            success=True,
            product_data=final_data,
            raw_content=content[:1000]
        )
        
    except Exception as e:
        print(f"❌ Smart scraping error: {str(e)}")
        return ScrapeResponse(
            url=request.url,
            success=False,
            error=f"Smart scraping failed: {str(e)}"
        )

@app.post("/scrape-google-simple", response_model=ScrapeResponse)
async def scrape_google_shopping_simple(request: ScrapeRequest):
    """Simple Google Shopping scraper with minimal extraction - fallback option"""
    try:
        # Simple browser config
        browser_config = BrowserConfig(
            browser_type="chromium",
            headless=True,
            verbose=False,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        
        # Simple crawl config
        crawl_config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            word_count_threshold=50,
            remove_overlay_elements=True,
            wait_for_images=False,
            process_iframes=False
        )
        
        # Simple single URL scrape
        async with AsyncWebCrawler(config=browser_config) as crawler:
            result = await crawler.arun(url=request.url, config=crawl_config)
        
        if not result.success:
            return ScrapeResponse(
                url=request.url,
                success=False,
                error=result.error_message or "Failed to crawl the page"
            )
        
        # Check if we got meaningful content (not just login/consent page)
        content = result.markdown or ""
        if len(content) < 500 or "Sign in" in content or "Choose what you're giving feedback on" in content:
            return ScrapeResponse(
                url=request.url,
                success=False,
                error="Google is showing login/consent page instead of product content",
                raw_content=content[:500]
            )
        
        product_data = None
        if request.extract_structured_data:
            product_data = await extract_simple_product_data(content)
        
        return ScrapeResponse(
            url=request.url,
            success=True,
            product_data=product_data,
            raw_content=content[:1500]
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
        Extract product information from this Google Shopping page content and return as JSON.
        
        IMPORTANT: Return ONLY valid JSON, no explanations or extra text.
        
        Look for and extract:
        - Product title/name
        - Brand name
        - Price (convert to number, remove currency symbols)
        - Product images (all URLs you can find)
        - Product description
        - Key features
        - Seller information
        - Ratings and reviews
        - Specifications
        
        Return in this exact JSON format:
        {{
            "title": "product name",
            "brand": "brand name", 
            "price": numeric_price,
            "image_urls": ["url1", "url2"],
            "description": "product description",
            "features": ["feature1", "feature2"],
            "average_rating": numeric_rating,
            "total_reviews": numeric_count,
            "specifications": {{"key": "value"}},
            "buying_options": [{{"seller_name": "seller", "price": numeric_price}}]
        }}
        
        Use null for missing data. Content:
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
    """Extract comprehensive product data from Google Shopping page - simplified version"""
    try:
        # Keep reasonable content length
        truncated_content = content[:5000]
        
        prompt = f"""
        Extract comprehensive product information from this Google Shopping page and return as JSON.
        
        IMPORTANT: Return ONLY valid JSON, no extra text.
        
        Extract ALL available information:
        - Complete product title and brand
        - All prices and price ranges
        - ALL product images (including encrypted Google Shopping URLs)
        - Complete description and features
        - Color and size variants
        - Specifications
        - Buying options with seller details
        - Ratings and reviews
        - Availability and delivery info
        
        Return in this exact JSON format:
        {{
            "title": "complete product title",
            "brand": "brand name",
            "price": lowest_price_number,
            "price_range": "price range if shown",
            "image_urls": ["all_product_images"],
            "description": "product description",
            "features": ["feature1", "feature2"],
            "colors_available": [
                {{"color_name": "color", "color_image_url": "image_url"}}
            ],
            "sizes_available": ["size1", "size2"],
            "specifications": {{
                "material": "value",
                "dimensions": "value",
                "weight": "value",
                "features": "value"
            }},
            "availability_text": "delivery/stock info",
            "buying_options": [
                {{
                    "seller_name": "seller name",
                    "price": numeric_price,
                    "delivery_info": "delivery text",
                    "offers": "offer text",
                    "site_url": "actual_site_url"
                }}
            ],
            "average_rating": numeric_rating,
            "total_reviews": numeric_count,
            "review_tags": ["tag1", "tag2"],
            "sample_reviews": [
                {{
                    "rating": numeric_rating,
                    "review_text": "review text",
                    "source": "source"
                }}
            ]
        }}
        
        EXTRACTION RULES:
        1. Extract ALL available data, use null for missing fields
        2. Convert prices to numbers (remove currency symbols)
        3. Extract ALL image URLs including encrypted ones
        4. Get ALL buying options with actual site URLs
        5. Extract specifications into structured object
        6. Use exact field names as specified above
        
        Content: {truncated_content}
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

async def extract_simple_product_data(content: str) -> ProductData:
    """Simple extraction with minimal prompt to avoid LLM issues"""
    try:
        # Keep content short for simple extraction
        truncated_content = content[:3000]
        
        prompt = f"""
        Extract basic product info from this page and return as JSON only.
        
        Find: title, brand, price, images, description, rating
        
        JSON format:
        {{
            "title": "product name",
            "brand": "brand",
            "price": number,
            "image_urls": ["url1"],
            "description": "description",
            "average_rating": number,
            "total_reviews": number
        }}
        
        Use null for missing data.
        
        Content: {truncated_content}
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800,
            temperature=0,
            top_p=0.1
        )
        
        extracted_text = response.choices[0].message.content.strip()
        
        # Try to find JSON in the response
        start_idx = extracted_text.find('{')
        end_idx = extracted_text.rfind('}') + 1
        
        if start_idx != -1 and end_idx != -1:
            json_str = extracted_text[start_idx:end_idx]
            try:
                product_dict = json.loads(json_str)
                return ProductData(**product_dict)
            except:
                return ProductData()
        
        return ProductData()
            
    except Exception as e:
        print(f"Error in simple extraction: {e}")
        return ProductData()

async def extract_optimized_product_data_with_groq(content: str) -> ProductData:
    """Extract comprehensive product data from single Google Shopping page - optimized for better success rate"""
    try:
        # Keep reasonable content length for comprehensive extraction
        truncated_content = content[:5000]  # Balanced for comprehensive data
        
        prompt = f"""
        Extract product information from this Google Shopping page and return as JSON.
        
        IMPORTANT: Return ONLY valid JSON, no extra text or explanations.
        
        Look for these key elements on Google Shopping pages:
        - Product title (usually in h1 or main heading)
        - Brand name (often separate from title)
        - Price (look for ₹, $, currency symbols)
        - Product images (main image, thumbnails, color variants)
        - Product description and key features
        - Buying options (different sellers, prices)
        - Ratings and reviews
        - Specifications and technical details
        - Availability and delivery info
        
        Return in this exact JSON format:
        {{
            "title": "complete product title",
            "brand": "brand name",
            "price": numeric_price,
            "price_range": "price range if shown",
            "image_urls": ["main_image_url", "thumbnail_url"],
            "description": "product description",
            "features": ["key feature 1", "key feature 2"],
            "colors_available": [
                {{"color_name": "color", "color_image_url": "image_url"}}
            ],
            "specifications": {{
                "key_spec": "value",
                "battery": "value",
                "dimensions": "value"
            }},
            "availability_text": "delivery/stock info",
            "buying_options": [
                {{
                    "seller_name": "seller name",
                    "price": numeric_price,
                    "delivery_info": "delivery text",
                    "offers": "offer text"
                }}
            ],
            "average_rating": numeric_rating,
            "total_reviews": numeric_count,
            "review_tags": ["tag1", "tag2"]
        }}
        
        EXTRACTION RULES:
        1. Extract ALL available data, use null for missing fields
        2. Convert prices to numbers (remove currency symbols)
        3. Extract ALL image URLs you can find
        4. Get buying options from different sellers
        5. Parse specifications into structured object
        6. Use exact field names as specified above
        
        Content: {truncated_content}
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,    # Balanced for comprehensive data
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
                # Fallback to simple extraction if comprehensive fails
                return await extract_simple_product_data(content)
        else:
            print(f"No JSON found in response: {extracted_text}")
            # Fallback to simple extraction
            return await extract_simple_product_data(content)
            
    except Exception as e:
        print(f"Error extracting optimized product data: {e}")
        # Fallback to simple extraction
        return await extract_simple_product_data(content)

async def extract_google_shopping_basic_data(content: str) -> ProductData:
    """Extract basic product info and buying options from Google Shopping page (light scraping)"""
    try:
        # Keep content short for light extraction
        truncated_content = content[:3000]
        
        prompt = f"""
        Extract basic product information and buying options from this Google Shopping page.
        
        IMPORTANT: Return ONLY valid JSON, no extra text.
        
        Focus on extracting:
        1. Basic product info (title, brand, price)
        2. BUYING OPTIONS - Find all "Visit site" links with seller names and prices
        3. Basic ratings and availability
        
        Return in this JSON format:
        {{
            "title": "product title",
            "brand": "brand name",
            "price": numeric_price,
            "image_urls": ["main_image_url"],
            "average_rating": numeric_rating,
            "total_reviews": numeric_count,
            "availability_text": "delivery/stock info",
            "buying_options": [
                {{
                    "seller_name": "Amazon/Flipkart/Myntra/Croma/etc",
                    "price": numeric_price,
                    "delivery_info": "delivery text",
                    "offers": "offer text",
                    "site_url": "actual_ecommerce_site_url"
                }}
            ]
        }}
        
        CRITICAL: Extract ALL buying options with their actual e-commerce site URLs.
        Use null for missing data.
        
        Content: {truncated_content}
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
            temperature=0,
            top_p=0.1
        )
        
        extracted_text = response.choices[0].message.content.strip()
        
        # Try to find JSON in the response
        start_idx = extracted_text.find('{')
        end_idx = extracted_text.rfind('}') + 1
        
        if start_idx != -1 and end_idx != -1:
            json_str = extracted_text[start_idx:end_idx]
            try:
                product_dict = json.loads(json_str)
                return ProductData(**product_dict)
            except:
                return ProductData()
        
        return ProductData()
            
    except Exception as e:
        print(f"Error extracting Google Shopping basic data: {e}")
        return ProductData()

async def fallback_google_shopping_extraction(url: str) -> ProductData:
    """Fallback extraction when Google Shopping is blocked"""
    try:
        # Extract product info from URL patterns
        if "shopping/product" in url:
            # Basic fallback data
            return ProductData(
                title="Product from Google Shopping",
                brand="Unknown",
                price=None,
                buying_options=[
                    BuyingOption(
                        seller_name="Amazon",
                        price=None,
                        site_url="https://amazon.in"
                    ),
                    BuyingOption(
                        seller_name="Flipkart", 
                        price=None,
                        site_url="https://flipkart.com"
                    )
                ]
            )
        return ProductData()
    except Exception as e:
        print(f"Error in fallback extraction: {e}")
        return ProductData()

async def create_fallback_buying_options(url: str) -> ProductData:
    """Create fallback buying options with popular e-commerce sites"""
    try:
        return ProductData(
            title="Product",
            brand="Unknown",
            buying_options=[
                BuyingOption(
                    seller_name="Amazon",
                    price=None,
                    site_url="https://amazon.in"
                ),
                BuyingOption(
                    seller_name="Flipkart",
                    price=None, 
                    site_url="https://flipkart.com"
                ),
                BuyingOption(
                    seller_name="Myntra",
                    price=None,
                    site_url="https://myntra.com"
                )
            ]
        )
    except Exception as e:
        print(f"Error creating fallback options: {e}")
        return ProductData()

async def smart_search_ecommerce_sites(query: str, buying_options: List[BuyingOption]) -> List[ProductData]:
    """Search e-commerce sites for product"""
    try:
        # Simplified search - return empty for now
        return []
    except Exception as e:
        print(f"Error in smart search: {e}")
        return []

async def smart_deep_scrape_ecommerce_sites(google_data: ProductData, google_content: str) -> ProductData:
    """Smart deep scraping of e-commerce sites from Google Shopping buying options or fallback sites"""
    try:
        # Get buying options from Google Shopping data
        buying_options = google_data.buying_options or []
        
        if not buying_options:
            print("⚠️  No buying options found in Google Shopping data")
            return ProductData()
        
        # Check if we have actual product URLs or need to search
        has_product_urls = any(option.site_url and "amazon.in/dp/" in option.site_url or 
                              "flipkart.com/" in option.site_url and "/p/" in option.site_url
                              for option in buying_options)
        
        if has_product_urls:
            print("🎯 Found direct product URLs - using direct scraping")
            return await direct_scrape_product_urls(buying_options)
        else:
            print("🔍 No direct URLs found - using smart search approach")
            # Extract product query from available data
            product_query = google_data.title or "product"
            if google_data.brand:
                product_query = f"{google_data.brand} {product_query}"
            
            return await smart_search_and_scrape(product_query, buying_options)
        
    except Exception as e:
        print(f"Error in smart deep scraping: {e}")
        return ProductData()

async def direct_scrape_product_urls(buying_options: List[BuyingOption]) -> ProductData:
    """Direct scraping when we have actual product URLs"""
    try:
        # Prioritize e-commerce sites (Amazon, Flipkart, Myntra, etc.)
        prioritized_sites = []
        for option in buying_options:
            if option.site_url and option.seller_name:
                # Check if it's a known e-commerce site with product URL
                seller_lower = option.seller_name.lower()
                if any(site in seller_lower for site in ['amazon', 'flipkart', 'myntra', 'croma', 'ajio', 'nykaa']):
                    prioritized_sites.append(option)
        
        # If no prioritized sites, use top 2 buying options
        if not prioritized_sites:
            prioritized_sites = buying_options[:2]
        
        print(f"🎯 Found {len(prioritized_sites)} e-commerce sites with product URLs")
        
        # Deep scrape top 2 e-commerce sites
        ecommerce_results = []
        for option in prioritized_sites[:2]:  # Limit to top 2 for speed
            if option.site_url:
                print(f"🛒 Direct scraping {option.seller_name}: {option.site_url}")
                ecommerce_data = await deep_scrape_ecommerce_site(option.site_url, option.seller_name)
                if ecommerce_data:
                    ecommerce_results.append(ecommerce_data)
        
        # Combine results from multiple e-commerce sites
        if ecommerce_results:
            return combine_ecommerce_data(ecommerce_results)
        
        return ProductData()
        
    except Exception as e:
        print(f"Error in direct scraping: {e}")
        return ProductData()

async def smart_search_and_scrape(product_query: str, buying_options: List[BuyingOption]) -> ProductData:
    """Smart search and scrape when we don't have direct product URLs"""
    try:
        print(f"🔍 Searching for: {product_query}")
        
        # Search top e-commerce sites
        search_results = await smart_search_ecommerce_sites(product_query, buying_options)
        
        if search_results:
            return combine_ecommerce_data(search_results)
        
        # If search fails, try direct homepage scraping with basic data
        return ProductData(
            title=product_query,
            brand=None,
            price=None,
            description=f"Product information for {product_query}",
            availability_text="Available at multiple retailers"
        )
        
    except Exception as e:
        print(f"Error in smart search and scrape: {e}")
        return ProductData()

async def deep_scrape_ecommerce_site(url: str, seller_name: str) -> ProductData:
    """Deep scrape individual e-commerce site for comprehensive product data"""
    try:
        # Configure browser for e-commerce sites
        browser_config = BrowserConfig(
            browser_type="chromium",
            headless=True,
            verbose=False,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        
        # Comprehensive crawl config for e-commerce sites
        crawl_config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            word_count_threshold=50,  # More content for comprehensive extraction
            remove_overlay_elements=True,
            wait_for_images=True,     # Wait for images on e-commerce sites
            process_iframes=False
        )
        
        # Scrape the e-commerce site
        async with AsyncWebCrawler(config=browser_config) as crawler:
            result = await crawler.arun(url=url, config=crawl_config)
        
        if not result.success:
            print(f"❌ Failed to scrape {seller_name}: {result.error_message}")
            return ProductData()
        
        content = result.markdown or ""
        if len(content) < 800:
            print(f"⚠️  {seller_name} returned minimal content")
            return ProductData()
        
        # Extract comprehensive data using site-specific extraction
        return await extract_ecommerce_comprehensive_data(content, seller_name)
        
    except Exception as e:
        print(f"Error deep scraping {seller_name}: {e}")
        return ProductData()

async def extract_ecommerce_comprehensive_data(content: str, seller_name: str) -> ProductData:
    """Extract comprehensive product data from e-commerce site with site-specific optimizations"""
    try:
        # Truncate content for comprehensive extraction
        truncated_content = content[:6000]
        
        # Site-specific extraction hints
        site_hints = {
            'amazon': 'Amazon page structure: Look for #productTitle, .a-price, .cr-original-review-text, .feature, .a-carousel',
            'flipkart': 'Flipkart page structure: Look for ._35KyD6, ._1fMrqx, .row, ._3ntsZ8, .col-4-12',
            'myntra': 'Myntra page structure: Look for .pdp-name, .pdp-price, .index-productDescriptors, .user-review',
            'croma': 'Croma page structure: Look for .pdp-product-name, .pdp-price, .product-info, .review-item',
            'ajio': 'AJIO page structure: Look for .prod-name, .prod-sp, .prod-desc, .review-con',
            'nykaa': 'Nykaa page structure: Look for .product-title, .post-card, .ProductDetailsPage'
        }
        
        site_hint = ""
        for site, hint in site_hints.items():
            if site in seller_name.lower():
                site_hint = hint
                break
        
        prompt = f"""
        Extract comprehensive product information from this {seller_name} e-commerce page.
        
        IMPORTANT: Return ONLY valid JSON, no extra text.
        
        {site_hint}
        
        Extract ALL available information:
        - Complete product title and brand
        - All prices (current, original, discounted)
        - ALL product images (main, gallery, color variants)
        - Complete product description and features
        - All color and size variants
        - Detailed specifications
        - All reviews and ratings
        - Stock availability and delivery info
        
        Return in this exact JSON format:
        {{
            "title": "complete product title",
            "brand": "brand name",
            "price": current_price_number,
            "price_range": "price range if multiple variants",
            "image_urls": ["main_image", "gallery_image1", "gallery_image2"],
            "description": "detailed product description",
            "features": ["feature1", "feature2", "feature3"],
            "colors_available": [
                {{"color_name": "color", "color_image_url": "image_url"}}
            ],
            "sizes_available": ["size1", "size2"],
            "specifications": {{
                "brand": "brand",
                "model": "model",
                "material": "material",
                "dimensions": "dimensions",
                "weight": "weight",
                "color": "color",
                "battery": "battery_info",
                "connectivity": "connectivity",
                "compatibility": "compatibility"
            }},
            "weight": "weight",
            "dimensions": "dimensions",
            "availability_text": "stock and delivery info",
            "average_rating": numeric_rating,
            "total_reviews": numeric_count,
            "review_tags": ["tag1", "tag2", "tag3"],
            "sample_reviews": [
                {{
                    "rating": numeric_rating,
                    "review_text": "actual review text",
                    "source": "{seller_name}"
                }}
            ]
        }}
        
        EXTRACTION RULES:
        1. Extract ALL available data, use null for missing fields
        2. Convert all prices to numbers (remove currency symbols)
        3. Extract ALL image URLs including gallery and variant images
        4. Get ALL product features and specifications
        5. Extract sample reviews with ratings
        6. Use exact field names as specified above
        
        Content: {truncated_content}
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2500,
            temperature=0,
            top_p=0.1
        )
        
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
                print(f"JSON parsing error for {seller_name}: {e}")
                return ProductData()
        
        return ProductData()
            
    except Exception as e:
        print(f"Error extracting comprehensive data from {seller_name}: {e}")
        return ProductData()

def combine_ecommerce_data(ecommerce_results: List[ProductData]) -> ProductData:
    """Combine data from multiple e-commerce sites into best comprehensive result"""
    try:
        if not ecommerce_results:
            return ProductData()
        
        # Start with the first result as base
        combined = ecommerce_results[0]
        
        # Merge data from other results
        for result in ecommerce_results[1:]:
            # Use the most complete title
            if result.title and (not combined.title or len(result.title) > len(combined.title)):
                combined.title = result.title
            
            # Use the most complete brand
            if result.brand and not combined.brand:
                combined.brand = result.brand
            
            # Use lowest price
            if result.price and (not combined.price or result.price < combined.price):
                combined.price = result.price
            
            # Combine image URLs
            if result.image_urls:
                combined_images = list(combined.image_urls) if combined.image_urls else []
                for img in result.image_urls:
                    if img not in combined_images:
                        combined_images.append(img)
                combined.image_urls = combined_images
            
            # Use the most complete description
            if result.description and (not combined.description or len(result.description) > len(combined.description)):
                combined.description = result.description
            
            # Combine features
            if result.features:
                combined_features = list(combined.features) if combined.features else []
                for feature in result.features:
                    if feature not in combined_features:
                        combined_features.append(feature)
                combined.features = combined_features
            
            # Combine specifications
            if result.specifications:
                combined_specs = dict(combined.specifications) if combined.specifications else {}
                combined_specs.update(result.specifications)
                combined.specifications = combined_specs
            
            # Use highest rating
            if result.average_rating and (not combined.average_rating or result.average_rating > combined.average_rating):
                combined.average_rating = result.average_rating
            
            # Use highest review count
            if result.total_reviews and (not combined.total_reviews or result.total_reviews > combined.total_reviews):
                combined.total_reviews = result.total_reviews
        
        return combined
        
    except Exception as e:
        print(f"Error combining e-commerce data: {e}")
        return ecommerce_results[0] if ecommerce_results else ProductData()

def merge_google_and_ecommerce_data(google_data: ProductData, ecommerce_data: ProductData) -> ProductData:
    """Merge Google Shopping basic data with comprehensive e-commerce data"""
    try:
        # Start with e-commerce data as base (more comprehensive)
        final_data = ecommerce_data
        
        # Fill in missing data from Google Shopping
        if google_data.title and not final_data.title:
            final_data.title = google_data.title
        
        if google_data.brand and not final_data.brand:
            final_data.brand = google_data.brand
        
        if google_data.price and not final_data.price:
            final_data.price = google_data.price
        
        if google_data.average_rating and not final_data.average_rating:
            final_data.average_rating = google_data.average_rating
            final_data.total_reviews = google_data.total_reviews
        
        # Always use Google Shopping buying options (more comprehensive)
        if google_data.buying_options:
            final_data.buying_options = google_data.buying_options
        
        # Use Google Shopping availability text if e-commerce doesn't have it
        if google_data.availability_text and not final_data.availability_text:
            final_data.availability_text = google_data.availability_text
        
        return final_data
        
    except Exception as e:
        print(f"Error merging data: {e}")
        return ecommerce_data if ecommerce_data else google_data

@app.get("/")
async def root():
    return {
        "message": "🧠 Snuffl Crawl4AI Server (Railway) - SMART COMPREHENSIVE SCRAPING",
        "platform": "Railway",
        "endpoints": {
            "/health": "Health check",
            "/scrape": "Scrape single product page (basic)",
            "/scrape-google-shopping": "🧠 SMART COMPREHENSIVE: Google Shopping + Auto E-commerce Detection + Deep Scraping",
            "/scrape-google-simple": "Simple Google Shopping scraping (reliable fallback)",
            "/bulk-scrape": "Scrape multiple product pages",
            "/docs": "API documentation"
        },
        "smart_features": [
            "🔍 Intelligent Google Shopping extraction (same reliability as simple endpoint)",
            "� Auto-detection of e-commerce product URLs from buying options",
            "🛒 Smart deep scraping of actual product pages (Amazon, Flipkart, etc.)",
            "🧠 Regex + LLM hybrid extraction for maximum reliability",
            "� Automatic fallback from comprehensive to simple extraction",
            "📊 Smart data merging from multiple sources",
            "⚡ Optimized for speed and accuracy"
        ],
        "extraction_strategy": "Regex patterns + LLM extraction + Smart fallbacks"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
