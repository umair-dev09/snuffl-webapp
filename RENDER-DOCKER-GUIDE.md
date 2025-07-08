# 🚀 Complete Guide: Deploy Crawl4AI to Render with Docker

## 📋 Step-by-Step Deployment Guide

### **Step 1: Push to GitHub (if not already done)**

```bash
# In your main project directory
git add .
git commit -m "Add Docker-based Crawl4AI server with Playwright support"
git push origin main
```

### **Step 2: Create New Render Service**

1. **Go to Render Dashboard:**
   - Visit: https://dashboard.render.com
   - Click "New +" button (top right)

2. **Choose Web Service:**
   - Click "Web Service"

3. **Connect Repository:**
   - Select "Build and deploy from a Git repository"
   - Click "Connect" next to your GitHub repository
   - If not connected, click "Connect GitHub" and authorize

4. **Select Repository:**
   - Find and select your `snuffl-webapp` repository
   - Click "Connect"

### **Step 3: Configure Docker Deployment**

**Service Configuration:**
- **Name:** `snuffl-crawl4ai-docker` (or any name you prefer)
- **Environment:** Select `Docker` ⚠️ **IMPORTANT: Must be Docker, not Python**
- **Region:** Choose closest to you (e.g., Oregon, Frankfurt)
- **Branch:** `main` (or your default branch)

**Build Configuration:**
- **Root Directory:** `crawl4ai-server` ⚠️ **IMPORTANT: Set this to your subdirectory**
- **Dockerfile Path:** `Dockerfile` (should auto-detect)

**Instance Type:**
- **Plan:** Choose `Starter` ($7/month) or higher
- Note: Starter should be sufficient for testing

### **Step 4: Set Environment Variables**

In the Environment Variables section, add:

| Key | Value |
|-----|-------|
| `GROQ_API_KEY` | `your_actual_groq_api_key_here` |
| `PORT` | `8000` |
| `PYTHONUNBUFFERED` | `1` |

**To get your Groq API key:**
1. Go to https://console.groq.com/keys
2. Create a new API key
3. Copy and paste it

### **Step 5: Deploy**

1. **Review settings** - Make sure everything looks correct
2. **Click "Create Web Service"**
3. **Wait for deployment** (10-15 minutes for Docker + Playwright)

### **Step 6: Monitor Build Logs**

Watch the logs for these success indicators:
```
✅ Building Docker image
✅ Installing Python dependencies
✅ Installing Playwright browsers
✅ Playwright verification successful
✅ Service started successfully
```

### **Step 7: Get Your Service URL**

Once deployed, you'll get a URL like:
```
https://snuffl-crawl4ai-docker.onrender.com
```

### **Step 8: Update Your Next.js App**

Update your `.env.local` file:
```bash
# Replace with your actual Render URL
CRAWL4AI_ENDPOINT=https://your-service-name.onrender.com
```

### **Step 9: Test the Deployment**

```bash
# Test the endpoint
node test-crawl4ai-endpoint.js

# Test full integration
node test-integration.js
```

## 🔍 **Expected Results After Deployment**

**Health Check:**
```json
{
  "status": "healthy",
  "service": "Snuffl Crawl4AI Server"
}
```

**Product Scrape:**
```json
{
  "url": "https://www.amazon.in/dp/B08N5WRWNW",
  "success": true,
  "product_data": {
    "name": "Actual Product Name",
    "price": "₹2,999",
    "rating": 4.3
  }
}
```

## 🚨 **Troubleshooting**

**If build fails:**
1. Check logs for specific errors
2. Ensure `Root Directory` is set to `crawl4ai-server`
3. Verify `Environment` is set to `Docker`

**If deployment succeeds but scraping fails:**
1. Check environment variables are set
2. Verify Groq API key is valid
3. Look at service logs for runtime errors

**Common issues:**
- ❌ **Wrong Environment**: Must be Docker, not Python
- ❌ **Wrong Root Directory**: Must point to `crawl4ai-server`
- ❌ **Missing Groq Key**: Check environment variables

## 💡 **Pro Tips**

1. **First deployment takes longer** due to Docker image building
2. **Subsequent deployments are faster** due to layer caching
3. **Monitor costs** - Starter plan should be sufficient for testing
4. **Check logs regularly** for any runtime issues

## 🎯 **Success Criteria**

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ Service shows "Live" status
- ✅ Health endpoint returns 200
- ✅ Product scraping returns actual data
- ✅ Integration test shows `scrapedProducts`

Ready to deploy! 🚀
