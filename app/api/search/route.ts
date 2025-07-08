import { NextRequest, NextResponse } from 'next/server'
import { analyzePrompt } from '@/utils/analyzePrompt'
import { getUserTwin } from '@/utils/getUserTwin'
import { scoreProducts } from '@/utils/scoreProducts'
import { generateAiSummary } from '@/utils/generateAiSummary'
import { supabase } from '@/lib/supabase'
import { generateEditorPick } from '@/utils/generateEditorPick'
import { fetchProductsFromSerper } from '@/lib/serperService'
import { crawl4aiService } from '@/lib/crawl4aiService'

export async function POST(req: NextRequest) {
  try {
    const { userId, query } = await req.json()

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    console.log(`🔍 Search request: "${query}" from user: ${userId || 'guest'}`)

    // 1. Analyze prompt
    const prompt = await analyzePrompt(query)
    console.log(`📝 Analyzed prompt category: ${prompt.category} \n budget: ${prompt.budget} \n use-case: ${prompt.use_case} \n priority features: ${prompt.priority_features} \n user strict budget: ${prompt.user_strict_budget}`)

    // 2. Fetch AI twin (optional)
    const twin = userId ? await getUserTwin(userId) : undefined

    // 3. Check if we have enough products in Supabase (20-30 products)
    let { data: existingProducts, error } = await supabase
      .from('products')
      .select('*')
      .or(`title.ilike.%${prompt.category}%,description.ilike.%${prompt.category}%,brand.ilike.%${prompt.category}%`)
      .order('price', { ascending: true })

    console.log(`💾 Found ${existingProducts?.length || 0} existing products in Supabase`)

    // 4. If we don't have enough products (less than 20), fetch from Serper API
    if (!existingProducts || existingProducts.length < 20) {
      console.log(`🚀 Not enough products in database. Fetching from Serper API...`)
      
      const serperProducts = await fetchProductsFromSerper(query, 30)
      console.log(`🛒 Serper API returned ${serperProducts.length} products`)

      if (serperProducts.length > 0) {
        // Step 5: Pass these product links to Crawl4AI for detailed scraping
        console.log(`�️ Sending ${serperProducts.length} product links to Crawl4AI...`)
        
        const scrapedProductData = await crawl4aiService.scrapeSerperProducts(serperProducts)
        console.log(`📦 Crawl4AI extracted data for ${scrapedProductData.length} products`)

        if (scrapedProductData.length > 0) {
          // TODO: Next step - Store these products in Supabase
          console.log(`💾 Ready to store ${scrapedProductData.length} products in Supabase`)
          
          // For now, return the scraped product data
          return NextResponse.json({
            message: 'Products successfully scraped with Crawl4AI',
            serperProductCount: serperProducts.length,
            scrapedProductCount: scrapedProductData.length,
            scrapedProducts: scrapedProductData.slice(0, 5), // Show first 5 as preview
            nextStep: 'Will store these products in Supabase database'
          })
        } else {
          return NextResponse.json({
            message: 'Serper API returned products but Crawl4AI failed to scrape them',
            serperProducts: serperProducts.slice(0, 5), // Show first 5 as fallback
            error: 'Crawl4AI scraping failed'
          }, { status: 206 }) // Partial content
        }
      } else {
        return NextResponse.json({ 
          error: 'No products found from Serper API' 
        }, { status: 404 })
      }
    } else {
      // We have enough products in database, proceed with existing logic
      console.log(`✅ Sufficient products found in database`)
      // TODO: Continue with scoring and ranking logic
      return NextResponse.json({
        message: 'Using existing products from database',
        productCount: existingProducts.length,
        products: existingProducts.slice(0, 9) // Return top 9 for now
      })
    }

  } catch (error) {
    console.error('❌ Error in search API:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
