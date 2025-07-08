# Crawl4AI Setup Guide for Snuffl AI MVP

## Option 1: Quick MVP Solution (Current Implementation)
✅ **Already Implemented** - Uses simple web scraping with cheerio as fallback

The app will automatically:
1. Try to connect to Crawl4AI server (if running)
2. Fall back to simple web scraping if Crawl4AI is not available

## Option 2: Full Crawl4AI Local Setup (Optional)

### Prerequisites
- Python 3.8+ installed
- pip package manager

### Step 1: Install Crawl4AI
```bash
# Create a virtual environment (recommended)
python -m venv crawl4ai-env

# Activate virtual environment
# Windows:
crawl4ai-env\Scripts\activate
# macOS/Linux:
source crawl4ai-env/bin/activate

# Install Crawl4AI
pip install crawl4ai

# Install additional dependencies for better performance
pip install playwright
playwright install chromium
```

### Step 2: Create Crawl4AI Server
Create a file `crawl4ai-server.py`:

```python
from crawl4ai import WebCrawler
from flask import Flask, request, jsonify
import asyncio
import threading

app = Flask(__name__)

@app.route('/crawl', methods=['POST'])
def crawl():
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Create crawler instance
        crawler = WebCrawler(verbose=True)
        
        # Run crawler
        result = crawler.run(url=url)
        
        if result.success:
            return jsonify({
                'url': url,
                'title': result.metadata.get('title', ''),
                'content': result.markdown[:5000],  # Limit content
                'html': result.html[:5000],
                'links': result.links[:20],  # Limit links
                'success': True
            })
        else:
            return jsonify({'error': 'Crawling failed', 'success': False}), 500
            
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

if __name__ == '__main__':
    app.run(host='localhost', port=11235, debug=True)
```

### Step 3: Run the Server
```bash
# Make sure you're in the virtual environment
python crawl4ai-server.py
```

## Option 3: Docker Setup (Alternative)
Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  crawl4ai:
    image: unclecode/crawl4ai:latest
    ports:
      - "11235:11235"
    environment:
      - PORT=11235
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

## Testing Your Setup

### Test the API endpoint:
```bash
curl -X POST http://localhost:11235/crawl \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.amazon.in/some-product"}'
```

### Test in your app:
The app will automatically detect if Crawl4AI is running and use it, otherwise it falls back to the simple scraper.

## Environment Variables (Optional)
Add to your `.env.local`:

```env
# Crawl4AI Configuration
CRAWL4AI_ENDPOINT=http://localhost:11235/crawl
CRAWL4AI_TIMEOUT=10000
USE_CRAWL4AI=true
```

## Troubleshooting

### Common Issues:
1. **Port 11235 in use**: Change port in server script
2. **Python not found**: Install Python 3.8+
3. **Permission errors**: Run with admin/sudo privileges
4. **Network issues**: Check firewall settings

### Fallback Behavior:
- ✅ App works without Crawl4AI (uses simple scraper)
- ✅ Graceful degradation
- ✅ Error logging for debugging

## Performance Tips
- Use Crawl4AI for better data quality
- Simple scraper works for MVP testing
- Consider rate limiting for production
- Cache results to avoid repeated scraping

## Next Steps for Production
1. Deploy Crawl4AI to cloud service
2. Add authentication
3. Implement rate limiting
4. Set up monitoring
5. Use proxy services for scale
