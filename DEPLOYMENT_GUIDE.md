# 🚀 Quick Crawl4AI Deployment Guide

## Step 1: Prepare for Deployment (5 minutes)

1. **Create a GitHub repository** (if you haven't):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/snuffl-crawl4ai.git
   git push -u origin main
   ```

2. **Upload the `crawl4ai-server` folder** to your GitHub repo

## Step 2: Deploy to Railway.app (10 minutes)

### Method A: One-Click Deploy
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/crawl4ai)

### Method B: Manual Deploy
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (free)
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Choose the `crawl4ai-server` folder as root
6. Railway will auto-detect the Dockerfile and deploy

## Step 3: Configure Environment (2 minutes)

1. Once deployed, Railway will give you a URL like:
   `https://crawl4ai-production-xxxx.up.railway.app`

2. Update your `.env.local`:
   ```env
   CRAWL4AI_ENDPOINT=https://your-actual-url.railway.app/crawl
   ```

## Step 4: Test Your Setup (3 minutes)

1. **Health Check:**
   ```bash
   curl https://your-app.railway.app/
   ```

2. **Test Crawling:**
   ```bash
   curl -X POST https://your-app.railway.app/crawl \
     -H "Content-Type: application/json" \
     -d '{"url": "https://www.amazon.in"}'
   ```

3. **Test in your app:**
   - Run your Snuffl app: `npm run dev`
   - Try a search: "Best headphones under ₹3000"
   - Check console logs for "✅ Successfully crawled"

## Alternative Free Hosts

### Option 2: Render.com
1. Go to [render.com](https://render.com)
2. Connect GitHub
3. Create "Web Service"
4. Use these settings:
   - **Build Command:** `pip install -r requirements.txt && playwright install chromium`
   - **Start Command:** `gunicorn --bind 0.0.0.0:$PORT --timeout 120 app:app`

### Option 3: Heroku (if available)
```bash
heroku create your-crawl4ai-app
heroku container:push web
heroku container:release web
```

## Troubleshooting

### Common Issues:
1. **Build fails:** Check Dockerfile syntax
2. **Service sleeps:** Free tiers auto-sleep (normal)
3. **Timeout errors:** Increase timeout in your app
4. **Memory issues:** Use lighter crawling options

### Debug Commands:
```bash
# Check service status
curl https://your-app.railway.app/status

# Check logs in Railway dashboard
# Go to: Project → Deployments → View Logs
```

## Free Tier Limits
- **Railway:** 500 hours/month, 512MB RAM
- **Render:** 750 hours/month, 512MB RAM
- **Automatic sleep** after 15 minutes of inactivity

## Pro Tips
1. **Cache results** in Supabase to reduce API calls
2. **Add rate limiting** to stay within free limits
3. **Monitor usage** in Railway/Render dashboard
4. **Use webhooks** to wake sleeping services

## Cost Optimization
- Each crawl takes ~2-5 seconds
- 1000 crawls ≈ 1.5 hours of usage
- Free tier = ~20,000 crawls/month

---

**🎉 You're all set!** Your Crawl4AI service should now be running on Railway for free!
