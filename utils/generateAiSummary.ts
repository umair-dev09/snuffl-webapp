// utils/generateAiSummary.ts
import { askGemini } from '@/lib/askGemini'
import { PromptAnalysis } from './analyzePrompt'
import { UserTwin } from './getUserTwin'
import { parseJsonResponse } from './cleanJsonResponse'

type Summary = {
  tag: string
  snufflTake: string
  pros: string[]
  cons: string[]
  smartRating: string
}

type Product = {
  title: string
  price: number
  brand?: string
  features?: string[]
  reviews?: string
}

export async function generateAiSummary(
  product: Product,
  prompt: PromptAnalysis,
  twin?: UserTwin
): Promise<Summary> {
  const context = `
User is looking for:
- Category: ${prompt.category}
- Budget: ₹${prompt.budget || 'Not specified'}
- Use Case: ${prompt.use_case || 'General'}

User preferences:
- Likes: ${twin?.preferred_colors?.join(', ') || 'Any colors'}
- Brands: ${twin?.preferred_brands?.join(', ') || 'Any brands'}
- Style: ${twin?.styles?.join(', ') || 'Any style'}
- Dislikes: ${twin?.dislikes?.join(', ') || 'None'}

Product:
- Title: ${product.title}
- Brand: ${product.brand || 'Unknown'}
- Price: ₹${product.price}
- Features: ${product.features?.join(', ') || 'N/A'}
- Reviews Summary: ${product.reviews || 'N/A'}
`

  const promptText = `
Based on the above, generate a JSON summary for this product recommendation with:

{
  "tag": "Smart Pick",
  "snufflTake": "Perfect for XYZ",
  "pros": ["...", "..."],
  "cons": ["...", "..."],
  "smartRating": "4.3⭐ · Loved by [audience]"
}

Use fun but helpful language. Do not include any explanation or extra text. Return clean JSON only.
`

  try {
    const result = await askGemini({
      prompt: context + '\n\n' + promptText,
      model: 'gemini-1.5-pro',
      temperature: 0.6,
      maxTokens: 1024
    })

    return parseJsonResponse(result, {
      tag: "Editor's Pick",
      snufflTake: "Popular among shoppers for its value.",
      pros: [],
      cons: [],
      smartRating: "4.0⭐"
    })
  } catch (e) {
    console.error('Failed to parse Gemini summary:', e)
    return {
      tag: "Editor's Pick",
      snufflTake: "Popular among shoppers for its value.",
      pros: [],
      cons: [],
      smartRating: "4.0⭐"
    }
  }
}
