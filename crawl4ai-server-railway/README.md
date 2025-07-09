# Snuffl Crawl4AI Server - Railway Deployment

This is the Railway deployment version of the Snuffl Crawl4AI server.

## 🚀 Quick Deploy to Railway

1. **Create Railway Account**: Go to [railway.app](https://railway.app) and sign up

2. **Deploy from GitHub**:
   - Connect your GitHub repository
   - Select this folder (`crawl4ai-server-railway`)
   - Railway will auto-detect the configuration

3. **Set Environment Variables**:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   PORT=8000
   ```

4. **Deploy**: Railway will automatically build and deploy

## 📋 Manual Setup

If you prefer manual setup:

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Create new project
railway new

# 4. Deploy
railway up

# 5. Set environment variables
railway variables set GROQ_API_KEY=your_groq_api_key_here
```

## 🔧 Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Install Playwright
python install_playwright.py

# Run server
uvicorn main:app --reload --port 8000
```

## 📊 Performance Comparison

Use this Railway deployment to compare performance against Render:

### Railway URL: 
`https://your-railway-app.railway.app`

### Render URL: 
`https://snuffl-crawl4ai-docker.onrender.com`

### Test Endpoints:
- Health: `GET /health`
- Single Scrape: `POST /scrape`
- Bulk Scrape: `POST /bulk-scrape`

## 🏗️ Architecture

- **Platform**: Railway
- **Language**: Python 3.11
- **Framework**: FastAPI
- **Web Crawler**: Crawl4AI v0.6.3
- **AI Processing**: Groq Llama 3.1
- **Browser**: Playwright Chromium

## 🔍 Key Features

- ✅ Async web crawling with Crawl4AI
- ✅ Bulk URL processing with `arun_many`
- ✅ Groq AI integration for product data extraction
- ✅ Docker containerization
- ✅ Health checks and monitoring
- ✅ Error handling and retries

## 🚦 Health Check

```bash
curl https://your-railway-app.railway.app/health
```

## 📝 API Documentation

Once deployed, visit:
`https://your-railway-app.railway.app/docs`

## ⚡ Performance Notes

Railway typically offers:
- Faster cold starts than Render
- Better resource allocation
- Lower latency in some regions
- More predictable performance

Compare with your Render deployment to see which works better for your use case!
