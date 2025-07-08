# quick_test.py - Quick test of Crawl4AI 0.6.3 integration
import asyncio
import os
from dotenv import load_dotenv

# Test if we can import the new API
try:
    from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
    print("✅ Successfully imported Crawl4AI 0.6.3 components")
except ImportError as e:
    print(f"❌ Import failed: {e}")
    exit(1)

# Test if we can import Groq
try:
    from groq import Groq
    print("✅ Successfully imported Groq")
except ImportError as e:
    print(f"❌ Groq import failed: {e}")
    exit(1)

async def test_basic_crawl():
    """Test basic crawling functionality"""
    try:
        print("\n🧪 Testing basic AsyncWebCrawler functionality...")
        
        # Configure browser
        browser_config = BrowserConfig(
            browser_type="chromium",
            headless=True,
            verbose=False
        )
        
        # Configure crawling
        crawl_config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            word_count_threshold=5
        )
        
        # Test with a simple page
        async with AsyncWebCrawler(config=browser_config) as crawler:
            result = await crawler.arun(
                url="https://httpbin.org/html",
                config=crawl_config
            )
        
        print(f"✅ Crawl successful: {result.success}")
        if result.success:
            print(f"📄 Content length: {len(result.markdown) if result.markdown else 0}")
        else:
            print(f"❌ Error: {result.error_message}")
            
        return result.success
        
    except Exception as e:
        print(f"❌ Basic crawl test failed: {e}")
        return False

async def test_groq_connection():
    """Test Groq API connection"""
    try:
        load_dotenv()
        api_key = os.getenv("GROQ_API_KEY")
        
        if not api_key:
            print("⚠️ GROQ_API_KEY not found in environment")
            return False
            
        client = Groq(api_key=api_key)
        
        # Simple test
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": "Say 'Hello Crawl4AI'"}],
            max_tokens=10
        )
        
        print(f"✅ Groq connection successful: {response.choices[0].message.content}")
        return True
        
    except Exception as e:
        print(f"❌ Groq test failed: {e}")
        return False

async def main():
    print("🚀 Quick Test for Crawl4AI 0.6.3 + Groq Integration")
    print("=" * 50)
    
    # Test basic crawling
    crawl_success = await test_basic_crawl()
    
    # Test Groq
    groq_success = await test_groq_connection()
    
    print("\n📊 Test Results:")
    print(f"Crawl4AI: {'✅ PASS' if crawl_success else '❌ FAIL'}")
    print(f"Groq API: {'✅ PASS' if groq_success else '❌ FAIL'}")
    
    if crawl_success and groq_success:
        print("\n🎉 All tests passed! Ready for deployment.")
    else:
        print("\n⚠️ Some tests failed. Check configuration.")

if __name__ == "__main__":
    asyncio.run(main())
