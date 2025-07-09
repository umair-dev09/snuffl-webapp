import subprocess
import sys
import os

def ensure_playwright_installed():
    """Ensure Playwright browsers are installed"""
    try:
        print("🔧 Installing Playwright browsers...")
        
        # Install Playwright browsers
        result = subprocess.run([
            sys.executable, "-c", 
            "import playwright; playwright.install()"
        ], capture_output=True, text=True, timeout=300)
        
        if result.returncode == 0:
            print("✅ Playwright browsers installed successfully")
            
            # Install system dependencies
            print("🔧 Installing Playwright system dependencies...")
            deps_result = subprocess.run([
                "playwright", "install-deps"
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
