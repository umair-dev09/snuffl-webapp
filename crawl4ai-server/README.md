# Snuffl Crawl4AI Server (v0.6.3)

A FastAPI-based web scraping service using Crawl4AI v0.6.3 and Groq's Llama model for intelligent product data extraction.

## Features

- **Modern Async API**: Uses Crawl4AI's new AsyncWebCrawler with proper async context management
- **Efficient Bulk Processing**: Leverages `arun_many()` for optimized concurrent crawling
- **Smart Configuration**: Separate BrowserConfig and CrawlerRunConfig for modular setup
- **AI-Powered Extraction**: Uses Groq's Llama 3.1 model for structured data extraction
- **Resource Management**: Automatic cleanup and memory-conscious processing
- **Error Handling**: Robust error handling and response formatting

## API Endpoints

### Health Check
```
GET /health
```

### Single Page Scraping
```
POST /scrape
Content-Type: application/json

{
  "url": "https://example.com/product-page",
  "extract_structured_data": true
}
```

### Bulk Scraping
```
POST /bulk-scrape
Content-Type: application/json

{
  "urls": [
    "https://example.com/product1",
    "https://example.com/product2"
  ],
  "extract_structured_data": true
}
```

## Deployment on Render

1. **Create Render Account**: Sign up at https://render.com
2. **Connect Repository**: Link your GitHub repository
3. **Configure Service**:
   - **Environment**: Python 3.11+
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Set Environment Variables**:
   - `GROQ_API_KEY`: Your Groq API key from https://console.groq.com/keys

## Local Development

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set Environment Variables**:
   ```bash
   export GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Run Server**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Access API Documentation**:
   - Open http://localhost:8000/docs for interactive API docs

## Configuration

- **Concurrent Scraping**: Limited to 5 concurrent requests to prevent server overload
- **Response Size**: Raw content truncated to 1000 characters in responses
- **Timeout**: Default Crawl4AI timeout settings apply
- **Model**: Uses Llama 3.1 8B Instant for fast, cost-effective processing

## Environment Variables

- `GROQ_API_KEY`: Required - Your Groq API key
- `PORT`: Optional - Server port (default: 8000)

## Error Handling

The API returns structured error responses:
```json
{
  "url": "failed-url",
  "success": false,
  "error": "Error description"
}
```
