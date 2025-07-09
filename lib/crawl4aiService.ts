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
    // Remove trailing slash if present
    this.baseUrl = this.baseUrl.replace(/\/$/, '')
    console.log(`🔧 Crawl4AI service initialized with baseUrl: ${this.baseUrl}`)
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
        }),
        // Add timeout for single page scraping
        signal: AbortSignal.timeout(60000) // 1 minute timeout
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
      
      // If we have many URLs, process in smaller batches to avoid timeout
      if (urls.length > 3) {
        console.log(`📦 Processing in batches due to ${urls.length} URLs...`)
        return await this.scrapeInBatches(urls, extractStructuredData)
      }
      
      const response = await fetch(`${this.baseUrl}/bulk-scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls,
          extract_structured_data: extractStructuredData
        }),
        // Increase timeout for bulk operations
        signal: AbortSignal.timeout(300000) // 5 minutes timeout
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

  /**
   * Process URLs in smaller batches to avoid timeout issues
   */
  async scrapeInBatches(urls: string[], extractStructuredData: boolean = true, batchSize: number = 6): Promise<BulkScrapeResponse> {
    console.log(`📦 Processing ${urls.length} URLs in batches of ${batchSize}...`)
    
    const allResults: any[] = []
    let totalSuccessful = 0
    
    // For Railway optimization: Process batches in parallel when possible
    const batches = []
    for (let i = 0; i < urls.length; i += batchSize) {
      batches.push(urls.slice(i, i + batchSize))
    }
    
    console.log(`� Processing ${batches.length} batches in parallel for faster execution...`)
    
    // Process all batches in parallel (Railway can handle this better than Render)
    const batchPromises = batches.map(async (batch, index) => {
      console.log(`📦 Starting batch ${index + 1}/${batches.length} (${batch.length} URLs)...`)
      
      try {
        const response = await fetch(`${this.baseUrl}/bulk-scrape`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            urls: batch,
            extract_structured_data: extractStructuredData
          }),
          // Aggressive timeout for Railway (it's faster and more stable)
          signal: AbortSignal.timeout(60000) // 1 minute timeout per batch
        })

        if (!response.ok) {
          console.error(`❌ Batch ${index + 1} failed: HTTP ${response.status}`)
          return {
            batchIndex: index + 1,
            results: batch.map(url => ({
              url,
              success: false,
              error: `HTTP ${response.status}`,
              raw_content: null,
              product_data: null
            })),
            successful: 0
          }
        }

        const batchResult: BulkScrapeResponse = await response.json()
        console.log(`✅ Batch ${index + 1} completed: ${batchResult.successful_scrapes}/${batch.length} successful`)
        
        return {
          batchIndex: index + 1,
          results: batchResult.results,
          successful: batchResult.successful_scrapes
        }
        
      } catch (error) {
        console.error(`❌ Batch ${index + 1} error:`, error)
        return {
          batchIndex: index + 1,
          results: batch.map(url => ({
            url,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            raw_content: null,
            product_data: null
          })),
          successful: 0
        }
      }
    })
    
    // Wait for all batches to complete
    const batchResults = await Promise.all(batchPromises)
    
    // Combine results
    for (const batchResult of batchResults) {
      totalSuccessful += batchResult.successful
      allResults.push(...batchResult.results)
    }
    
    console.log(`🎯 Parallel batch processing complete: ${totalSuccessful}/${urls.length} total successful`)
    
    return {
      total_urls: urls.length,
      successful_scrapes: totalSuccessful,
      failed_scrapes: urls.length - totalSuccessful,
      results: allResults
    }
  }

  async scrapeSerperProducts(serperProducts: any[]): Promise<ProductData[]> {
    try {
      console.log(`🚀 Starting scrapeSerperProducts with ${serperProducts.length} products`)
      
      // Extract URLs from Serper products
      const urls = serperProducts.map(product => product.link).filter(Boolean)
      
      if (urls.length === 0) {
        console.log('⚠️ No valid URLs found in Serper products')
        return []
      }

      console.log(`🔗 Extracted ${urls.length} URLs from Serper products`)
      console.log(`🌐 Base URL: ${this.baseUrl}`)
      
      // Scrape all URLs
      console.log(`📡 Calling scrapeMultiplePages...`)
      const bulkResult = await this.scrapeMultiplePages(urls, true)
      console.log(`📊 Bulk result: ${bulkResult.successful_scrapes}/${bulkResult.total_urls} successful`)
      
      // Extract successful product data
      const productData: ProductData[] = []
      
      for (const result of bulkResult.results) {
        if (result.success) {
          // Merge Serper data with scraped data for better accuracy
          const serperProduct = serperProducts.find(p => p.link === result.url)
          const mergedData: ProductData = {
            // Use scraped data first, then fallback to Serper data
            name: result.product_data?.name || serperProduct?.title || 'Unknown Product',
            price: result.product_data?.price || serperProduct?.price || 'Price not available',
            rating: result.product_data?.rating || serperProduct?.rating || undefined,
            rating_count: result.product_data?.rating_count || serperProduct?.ratingCount || undefined,
            image_url: result.product_data?.image_url || serperProduct?.imageUrl || undefined,
            brand: result.product_data?.brand || undefined,
            description: result.product_data?.description || undefined,
            availability: result.product_data?.availability || 'Available',
            original_price: result.product_data?.original_price || undefined,
            discount: result.product_data?.discount || undefined,
            specifications: result.product_data?.specifications || undefined
          }
          
          productData.push(mergedData)
          console.log(`✅ Processed product: ${mergedData.name} - ${mergedData.price}`)
        } else {
          console.log(`⚠️ Failed to scrape product: ${result.url} - ${result.error}`)
        }
      }

      console.log(`🎯 Final result: Successfully extracted data for ${productData.length} products`)
      return productData
      
    } catch (error) {
      console.error('❌ Error in scrapeSerperProducts:', error)
      throw error // Re-throw instead of returning empty array to see the actual error
    }
  }
}

// Export singleton instance
export const crawl4aiService = new Crawl4AIService()
