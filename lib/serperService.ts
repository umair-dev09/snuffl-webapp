// lib/serperService.ts
import axios from 'axios'

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

export async function fetchProductsFromSerper(query: string, count: number = 30): Promise<SerperProduct[]> {
  try {
    const data = JSON.stringify({
      "q": query,
      "gl": "in", // India
      "hl": "en", // English
      "num": count
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
    console.log(`🛒 Serper API returned ${response.data.shopping?.length || 0} products for query: "${query}"`)
    
    return response.data.shopping || []
  } catch (error) {
    console.error('❌ Error fetching from Serper API:', error)
    return []
  }
}
