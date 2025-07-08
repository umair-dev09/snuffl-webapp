# Test script for local development
import requests
import json
import asyncio
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get("http://localhost:8000/health")
        print("Health Check:", response.json())
        return True
    except Exception as e:
        print("Health Check Failed:", e)
        return False

def test_single_scrape():
    """Test single page scraping"""
    try:
        data = {
            "url": "https://www.amazon.in/dp/B08N5WRWNW",
            "extract_structured_data": True
        }
        response = requests.post("http://localhost:8000/scrape", json=data)
        print("Single Scrape Status:", response.status_code)
        if response.status_code == 200:
            result = response.json()
            print("Single Scrape Success:", result.get('success'))
            if result.get('product_data'):
                print("Product Name:", result['product_data'].get('name'))
                print("Product Price:", result['product_data'].get('price'))
        else:
            print("Single Scrape Error:", response.text)
        return response.status_code == 200
    except Exception as e:
        print("Single Scrape Failed:", e)
        return False

def test_bulk_scrape():
    """Test bulk scraping"""
    try:
        data = {
            "urls": [
                "https://www.amazon.in/dp/B08N5WRWNW",
                "https://www.flipkart.com/apple-iphone-13/p/itm6ac6485515ae4"
            ],
            "extract_structured_data": True
        }
        response = requests.post("http://localhost:8000/bulk-scrape", json=data)
        print("Bulk Scrape Status:", response.status_code)
        if response.status_code == 200:
            result = response.json()
            print(f"Bulk Scrape: {result.get('successful_scrapes')}/{result.get('total_urls')} successful")
        else:
            print("Bulk Scrape Error:", response.text)
        return response.status_code == 200
    except Exception as e:
        print("Bulk Scrape Failed:", e)
        return False

async def test_crawl4ai_directly():
    """Test Crawl4AI 0.6.3 directly"""
    try:
        print("\n🧪 Testing Crawl4AI 0.6.3 directly...")
        
        browser_config = BrowserConfig(
            browser_type="chromium",
            headless=True,
            verbose=True
        )
        
        crawl_config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            word_count_threshold=10
        )
        
        async with AsyncWebCrawler(config=browser_config) as crawler:
            result = await crawler.arun(
                url="https://www.amazon.in/dp/B08N5WRWNW",
                config=crawl_config
            )
        
        print(f"Direct Crawl Success: {result.success}")
        if result.success:
            print(f"Content Length: {len(result.markdown) if result.markdown else 0}")
            print(f"HTML Length: {len(result.html) if result.html else 0}")
        else:
            print(f"Error: {result.error_message}")
            
        return result.success
    except Exception as e:
        print(f"Direct Crawl Failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Crawl4AI Server (v0.6.3)...")
    
    # Test direct Crawl4AI usage first
    print("\n1. Testing Crawl4AI directly...")
    asyncio.run(test_crawl4ai_directly())
    
    # Test server endpoints
    print("\n2. Testing server health...")
    if test_health():
        print("\n3. Testing single scrape...")
        test_single_scrape()
        
        print("\n4. Testing bulk scrape...")
        test_bulk_scrape()
    else:
        print("❌ Server is not running. Start with: uvicorn main:app --reload")
