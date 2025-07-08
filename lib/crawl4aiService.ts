// lib/crawl4aiService.ts
interface ProductData {
  name?: string
  price?: string
  original_price?: string
  discount?: string
  rating?: number
  rating_count?: number
  image_url?: string
  description?: string
  brand?: string
  availability?: string
  specifications?: Record<string, string>
}

interface ScrapeResponse {
  url: string
  success: boolean
  product_data?: ProductData
  raw_content?: string
  error?: string
}

interface BulkScrapeResponse {
  total_urls: number
  successful_scrapes: number
  failed_scrapes: number
  results: ScrapeResponse[]
}

export class Crawl4AIService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.CRAWL4AI_ENDPOINT || 'http://localhost:8000'
  }

  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('❌ Crawl4AI health check failed:', error)
      throw error
    }
  }

  async scrapeSinglePage(url: string, extractStructuredData: boolean = true): Promise<ScrapeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          extract_structured_data: extractStructuredData
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ScrapeResponse = await response.json()
      console.log(`🕷️ Scraped ${url}: ${result.success ? 'SUCCESS' : 'FAILED'}`)
      
      return result
    } catch (error) {
      console.error(`❌ Failed to scrape ${url}:`, error)
      return {
        url,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async scrapeMultiplePages(urls: string[], extractStructuredData: boolean = true): Promise<BulkScrapeResponse> {
    try {
      console.log(`🚀 Starting bulk scrape of ${urls.length} URLs...`)
      
      const response = await fetch(`${this.baseUrl}/bulk-scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls,
          extract_structured_data: extractStructuredData
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: BulkScrapeResponse = await response.json()
      console.log(`✅ Bulk scrape completed: ${result.successful_scrapes}/${result.total_urls} successful`)
      
      return result
    } catch (error) {
      console.error('❌ Bulk scrape failed:', error)
      throw error
    }
  }

  async scrapeSerperProducts(serperProducts: any[]): Promise<ProductData[]> {
    try {
      // Extract URLs from Serper products
      const urls = serperProducts.map(product => product.link).filter(Boolean)
      
      if (urls.length === 0) {
        console.log('⚠️ No valid URLs found in Serper products')
        return []
      }

      console.log(`🔗 Extracted ${urls.length} URLs from Serper products`)
      
      // Scrape all URLs
      const bulkResult = await this.scrapeMultiplePages(urls, true)
      
      // Extract successful product data
      const productData: ProductData[] = []
      
      for (const result of bulkResult.results) {
        if (result.success && result.product_data) {
          // Merge Serper data with scraped data for better accuracy
          const serperProduct = serperProducts.find(p => p.link === result.url)
          const mergedData: ProductData = {
            ...result.product_data,
            // Use Serper data as fallback if scraping didn't extract certain fields
            name: result.product_data.name || serperProduct?.title,
            price: result.product_data.price || serperProduct?.price,
            rating: result.product_data.rating || serperProduct?.rating,
            rating_count: result.product_data.rating_count || serperProduct?.ratingCount,
            image_url: result.product_data.image_url || serperProduct?.imageUrl,
          }
          
          productData.push(mergedData)
        } else {
          console.log(`⚠️ Failed to scrape product: ${result.url}`)
        }
      }

      console.log(`📦 Successfully extracted data for ${productData.length} products`)
      return productData
      
    } catch (error) {
      console.error('❌ Error scraping Serper products:', error)
      return []
    }
  }
}

// Export singleton instance
export const crawl4aiService = new Crawl4AIService()
