# Test script for local development
import requests
import json

def test_health():
    """Test health endpoint"""
    response = requests.get("http://localhost:8000/health")
    print("Health Check:", response.json())

def test_single_scrape():
    """Test single page scraping"""
    data = {
        "url": "https://www.amazon.in/dp/B08N5WRWNW",
        "extract_structured_data": True
    }
    response = requests.post("http://localhost:8000/scrape", json=data)
    print("Single Scrape:", json.dumps(response.json(), indent=2))

def test_bulk_scrape():
    """Test bulk scraping"""
    data = {
        "urls": [
            "https://www.amazon.in/dp/B08N5WRWNW",
            "https://www.flipkart.com/apple-iphone-13/p/itm6ac6485515ae4"
        ],
        "extract_structured_data": True
    }
    response = requests.post("http://localhost:8000/bulk-scrape", json=data)
    print("Bulk Scrape:", json.dumps(response.json(), indent=2))

if __name__ == "__main__":
    print("Testing Crawl4AI Server...")
    test_health()
    # test_single_scrape()
    # test_bulk_scrape()
