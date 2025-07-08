// utils/analyzePrompt.ts
import { askGemini } from '@/lib/askGemini'
import { parseJsonResponse } from './cleanJsonResponse'

export type PromptAnalysis = {
  category: string
  budget?: number
  use_case?: string
  priority_features?: string[]
  user_strict_budget: boolean
}

export async function analyzePrompt(query: string): Promise<PromptAnalysis> {
  const prompt = `
Query: "${query}"

Extract:
- category (string)
- budget (number, if mentioned)
- use_case (e.g. work, gym, travel, gaming)
- priority_features (array of strings, e.g. headrest, bluetooth)
- user_strict_budget: true if the query uses words like "under", "below", "less than"

Respond ONLY with valid JSON. Do NOT include markdown formatting, code blocks, or explanations.
Example: {"category":"headphones","budget":2000,"use_case":"gym","priority_features":["wireless","waterproof"],"user_strict_budget":true}
`

  try {
    const result = await askGemini({
      prompt,
      system: 'You extract structured data from product search queries.',
      model: 'gemini-1.5-flash',
      temperature: 0.2
    })

    const parsed = parseJsonResponse(result, {})
    return {
      category: parsed.category || 'unknown',
      budget: parsed.budget,
      use_case: parsed.use_case,
      priority_features: parsed.priority_features || [],
      user_strict_budget: parsed.user_strict_budget ?? false
    }
  } catch (e) {
    console.error("Gemini Prompt Analysis Failed:", e)
    return {
      category: "unknown",
      budget: undefined,
      use_case: undefined,
      priority_features: [],
      user_strict_budget: false
    }
  }
}
