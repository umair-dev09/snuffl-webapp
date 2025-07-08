# Crawl4AI Server Deployment Guide (v0.6.3)

## Updated for Crawl4AI 0.6.3 + Playwright Fix

This guide covers deploying the updated Crawl4AI server that uses the new AsyncWebCrawler API with proper Playwright browser installation on Render.

### Key Changes in v0.6.3:
- Uses `AsyncWebCrawler` with async context manager (`async with`)
- Implements `BrowserConfig` for browser settings
- Uses `CrawlerRunConfig` for crawl-specific settings
- Leverages `arun_many()` for efficient bulk crawling
- **Fixed Playwright browser installation on Render**

## Critical Fix: Playwright Browsers

The main issue you encountered was that Playwright browsers weren't installed on Render. This is now fixed with:
1. Updated `render.yaml` with proper build commands
2. Added Playwright installation steps
3. Set required environment variables

## Quick Fix for Existing Deployment

If you already have a Render service deployed, you need to:

1. **Update your repository** with the new files:
   - Updated `requirements.txt` (includes Playwright)
   - Updated `render.yaml` (with browser installation)
   - New `Dockerfile` (alternative deployment method)

2. **Redeploy on Render**:
   - Go to your Render dashboard
   - Find your `snuffl-crawl4ai-server` service
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for the build to complete (this will take longer due to browser installation)

3. **Monitor the build logs** to ensure:
   - `pip install -r requirements.txt` succeeds
   - `playwright install chromium` succeeds
   - `playwright install-deps chromium` succeeds

## Alternative: Docker Deployment

If the native Python deployment still has issues, use Docker:

1. **Update Render Service**:
   - Change "Environment" from "Python" to "Docker"
   - Set "Dockerfile Path" to `Dockerfile`
   - Keep the same environment variables

2. **Docker build will**:
   - Install system dependencies
   - Install Python packages
   - Install Playwright browsers automatically

## Step-by-Step Render Deployment

### 1. Get Groq API Key
1. Visit https://console.groq.com/keys
2. Sign up/Login to Groq
3. Create a new API key
4. Copy the API key (you'll need it for deployment)

### 2. Prepare Your Repository
1. Ensure your `crawl4ai-server` folder is committed to your GitHub repository
2. The folder should contain:
   - `main.py` (FastAPI application)
   - `requirements.txt` (Python dependencies)
   - `render.yaml` (Render configuration)
   - `README.md` (Documentation)

### 3. Deploy on Render
1. **Create Render Account**: 
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Service**:
   - **Name**: `snuffl-crawl4ai-server`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r crawl4ai-server/requirements.txt`
   - **Start Command**: `cd crawl4ai-server && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Choose your preferred plan (Starter is fine for testing)

4. **Set Environment Variables**:
   - In the Render dashboard, go to "Environment"
   - Add: `GROQ_API_KEY` = `your_groq_api_key_here`

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for the build and deployment to complete

### 4. Update Your Next.js App
Once deployed, update your `.env.local` file:

```bash
# Replace with your actual Render URL
CRAWL4AI_ENDPOINT=https://your-service-name.onrender.com
```

### 5. Test Your Deployment

#### Test Health Endpoint
```bash
curl https://your-service-name.onrender.com/health
```

#### Test Scraping
```bash
curl -X POST https://your-service-name.onrender.com/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.amazon.in/dp/B08N5WRWNW", "extract_structured_data": true}'
```

### 6. Monitor and Maintain

1. **Check Logs**: Use Render dashboard to monitor logs
2. **Monitor Performance**: Watch response times and error rates
3. **Scale if Needed**: Upgrade plan if you need more resources

## Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check `requirements.txt` for correct dependencies
   - Ensure Python version compatibility

2. **Environment Variables**:
   - Verify `GROQ_API_KEY` is set correctly
   - Check for typos in variable names

3. **Timeout Issues**:
   - Crawl4AI might take time for complex pages
   - Consider increasing timeout in Render settings

4. **Memory Issues**:
   - Upgrade to a higher plan if needed
   - Monitor memory usage in Render dashboard

### Performance Tips:

1. **Concurrent Requests**: Limited to 5 to prevent overload
2. **Content Truncation**: Large content is truncated to optimize response size
3. **Error Handling**: Robust error handling prevents service crashes

## Cost Optimization

1. **Groq Usage**: Monitor API usage at https://console.groq.com
2. **Render Resources**: Start with Starter plan, scale as needed
3. **Request Batching**: Use bulk endpoints for multiple URLs

## Security

1. **API Key**: Keep Groq API key secure in environment variables
2. **CORS**: Configure CORS if needed for your frontend domain
3. **Rate Limiting**: Consider adding rate limiting for production use
