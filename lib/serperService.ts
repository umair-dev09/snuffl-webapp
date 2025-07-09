// lib/serperService.ts
import axios from 'axios'
import { PromptAnalysis } from '@/utils/analyzePrompt'

interface SerperProduct {
  title: string
  source: string
  link: string
  price: string
  imageUrl: string
  rating: number
  ratingCount: number
  productId: string
  position: number
}

interface SerperResponse {
  shopping: SerperProduct[]
}

/**
 * Extract numeric price from price string
 */
function extractPrice(priceStr: string): number {
  if (!priceStr) return 0
  // Remove currency symbols and commas, extract number
  const match = priceStr.replace(/[₹$,]/g, '').match(/[\d.]+/)
  return match ? parseFloat(match[0]) : 0
}

/**
 * Score and rank products based on user prompt analysis
 */
function scoreProducts(products: SerperProduct[], promptAnalysis: PromptAnalysis): SerperProduct[] {
  console.log(`🎯 Scoring ${products.length} products based on user preferences...`)
  
  const scoredProducts = products.map(product => {
    let score = 0
    const price = extractPrice(product.price)
    
    // 1. Budget scoring (40% weight)
    if (promptAnalysis.budget) {
      if (promptAnalysis.user_strict_budget) {
        // Strict budget: penalize products above budget heavily
        if (price <= promptAnalysis.budget) {
          score += 40 // Full points for within budget
        } else {
          score -= 20 // Heavy penalty for over budget
        }
      } else {
        // Flexible budget: prefer products near budget
        const budgetDiff = Math.abs(price - promptAnalysis.budget)
        const budgetScore = Math.max(0, 40 - (budgetDiff / promptAnalysis.budget) * 20)
        score += budgetScore
      }
    }
    
    // 2. Title relevance scoring (30% weight)
    const titleLower = product.title.toLowerCase()
    
    // Category relevance
    if (promptAnalysis.category && titleLower.includes(promptAnalysis.category.toLowerCase())) {
      score += 15
    }
    
    // Use case relevance
    if (promptAnalysis.use_case && titleLower.includes(promptAnalysis.use_case.toLowerCase())) {
      score += 10
    }
    
    // Priority features
    if (promptAnalysis.priority_features) {
      promptAnalysis.priority_features.forEach(feature => {
        if (titleLower.includes(feature.toLowerCase())) {
          score += 5
        }
      })
    }
    
    // 3. Rating and reviews scoring (20% weight)
    if (product.rating > 0) {
      score += (product.rating / 5) * 10 // Up to 10 points for 5-star rating
    }
    
    if (product.ratingCount > 0) {
      // More reviews = more reliable
      const reviewScore = Math.min(10, Math.log10(product.ratingCount) * 3)
      score += reviewScore
    }
    
    // 4. Source preference (10% weight)
    const trustedSources = ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa']
    const sourceLower = product.source.toLowerCase()
    
    if (trustedSources.some(source => sourceLower.includes(source))) {
      score += 10
    }
    
    return { ...product, score }
  })
  
  // Sort by score (descending)
  const rankedProducts = scoredProducts.sort((a, b) => b.score - a.score)
  
  console.log(`🏆 Top products scored:`)
  rankedProducts.slice(0, 5).forEach((p, i) => {
    console.log(`${i + 1}. ${p.title.substring(0, 50)}... - Score: ${p.score.toFixed(1)} - Price: ${p.price}`)
  })
  
  return rankedProducts
}

export async function fetchProductsFromSerper(
  query: string, 
  count: number = 12, 
  promptAnalysis?: PromptAnalysis
): Promise<SerperProduct[]> {
  try {
    // Fetch more products initially (30-40) to have a better pool for selection
    const fetchCount = Math.max(30, count * 2)
    
    const data = JSON.stringify({
      "q": query,
      "gl": "in", // India
      "hl": "en", // English
      "num": fetchCount
    })

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://google.serper.dev/shopping',
      headers: { 
        'X-API-KEY': process.env.SERPER_API_KEY || 'a6751ae4f2e5566c1e7c2ca3c7ed8c992615e875',
        'Content-Type': 'application/json'
      },
      data: data
    }

    const response = await axios.request(config)
    const allProducts = response.data.shopping || []
    console.log(`🛒 Serper API returned ${allProducts.length} products for query: "${query}"`)
    
    let selectedProducts: SerperProduct[]
    
    if (promptAnalysis && allProducts.length > count) {
      // Use intelligent ranking to select best products
      console.log(`🧠 Using intelligent ranking to select best ${count} from ${allProducts.length} products...`)
      const rankedProducts = scoreProducts(allProducts, promptAnalysis)
      selectedProducts = rankedProducts.slice(0, count)
      console.log(`✅ Selected top ${selectedProducts.length} products based on user preferences`)
    } else {
      // Fallback to simple slice if no prompt analysis
      selectedProducts = allProducts.slice(0, count)
      if (selectedProducts.length !== allProducts.length) {
        console.log(`✂️ Limited results from ${allProducts.length} to ${selectedProducts.length} products`)
      }
    }
    
    return selectedProducts
  } catch (error) {
    console.error('❌ Error fetching from Serper API:', error)
    return []
  }
}
