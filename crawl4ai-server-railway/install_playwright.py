import subprocess
import sys
import os

def ensure_playwright_installed():
    """Ensure Playwright browsers are installed"""
    try:
        print("🔧 Installing Playwright browsers...")
        
        # Install only chromium browser (faster and smaller)
        result = subprocess.run([
            sys.executable, "-m", "playwright", "install", "chromium"
        ], capture_output=True, text=True, timeout=300)
        
        if result.returncode == 0:
            print("✅ Playwright chromium browser installed successfully")
            
            # Install system dependencies for chromium only
            print("🔧 Installing Playwright system dependencies...")
            deps_result = subprocess.run([
                sys.executable, "-m", "playwright", "install-deps", "chromium"
            ], capture_output=True, text=True, timeout=300)
            
            if deps_result.returncode == 0:
                print("✅ Playwright system dependencies installed")
                return True
            else:
                print(f"⚠️ Warning: Failed to install system deps: {deps_result.stderr}")
                return True  # Continue anyway, might still work
        else:
            print(f"❌ Failed to install Playwright: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Playwright installation timed out")
        return False
    except Exception as e:
        print(f"❌ Error installing Playwright: {e}")
        return False

if __name__ == "__main__":
    ensure_playwright_installed()
