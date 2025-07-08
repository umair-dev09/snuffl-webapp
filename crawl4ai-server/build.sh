#!/bin/bash
# build.sh - Render build script for Crawl4AI with Playwright

set -e  # Exit on any error

echo "🚀 Starting Crawl4AI build process..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
python -m playwright install chromium

# Install system dependencies for Playwright
echo "🔧 Installing Playwright system dependencies..."
python -m playwright install-deps chromium

# Verify installation
echo "✅ Verifying Playwright installation..."
python -c "
from playwright.sync_api import sync_playwright
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        print('✅ Chromium browser installed successfully')
        browser.close()
except Exception as e:
    print(f'❌ Browser verification failed: {e}')
    exit(1)
"

echo "🎉 Build completed successfully!"
