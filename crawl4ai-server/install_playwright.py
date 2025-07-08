# install_playwright.py - Runtime Playwright installation helper
import subprocess
import sys
import os
from pathlib import Path

def ensure_playwright_installed():
    """Ensure Playwright browsers are installed"""
    try:
        # Check if chromium is already installed
        from playwright.sync_api import sync_playwright
        
        with sync_playwright() as p:
            # Try to launch chromium to test if it's working
            browser = p.chromium.launch(headless=True)
            browser.close()
            print("✅ Playwright chromium is already installed and working")
            return True
            
    except Exception as e:
        print(f"⚠️ Playwright not properly installed: {e}")
        print("🔧 Installing Playwright browsers...")
        
        try:
            # Install chromium browser
            subprocess.run([
                sys.executable, "-m", "playwright", "install", "chromium"
            ], check=True)
            
            # Install dependencies
            subprocess.run([
                sys.executable, "-m", "playwright", "install-deps", "chromium"
            ], check=True)
            
            print("✅ Playwright installation completed")
            return True
            
        except subprocess.CalledProcessError as install_error:
            print(f"❌ Failed to install Playwright: {install_error}")
            return False
        except Exception as install_error:
            print(f"❌ Unexpected error during installation: {install_error}")
            return False

if __name__ == "__main__":
    ensure_playwright_installed()
