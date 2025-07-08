// utils/generateEditorPick.ts
import { askGemini } from '@/lib/askGemini'
import { PromptAnalysis } from './analyzePrompt'
import { parseJsonResponse } from './cleanJsonResponse'

export async function generateEditorPick(prompt: PromptAnalysis) {
  const textPrompt = `
You're an AI shopping assistant.

User is looking for: "${prompt.category}" under ₹${prompt.budget || 'Flexible'}.

Generate a fallback product recommendation when no perfect match is found.

Include:
- "title" — catchy product name
- "price" — estimated price under budget
- "tag": "Editor's Pick"
- "snufflTake" — 1-liner
- "pros": 2–3 strengths
- "cons": 1–2 trade-offs
- "smartRating": star rating like "4.3⭐"

Return ONLY valid JSON. Do NOT include markdown formatting or explanations.
Example: {"title":"Product Name","price":1999,"tag":"Editor's Pick","snufflTake":"Great choice","pros":["feature1","feature2"],"cons":["issue1"],"smartRating":"4.3⭐"}
`

  try {
    const response = await askGemini({
      prompt: textPrompt,
      model: 'gemini-1.5-pro',
      temperature: 0.8,
      maxTokens: 512
    })

    return parseJsonResponse(response, {
      title: "Popular Pick by Snuffl",
      price: prompt.budget || 2999,
      tag: "Editor's Pick",
      snufflTake: "A solid backup choice when nothing else fits.",
      pros: ["Reliable", "Decent specs"],
      cons: ["Not the cheapest"],
      smartRating: "4.2⭐"
    })
  } catch (e) {
    console.error('Gemini fallback product generation failed:', e)
    return {
      title: "Popular Pick by Snuffl",
      price: prompt.budget || 2999,
      tag: "Editor's Pick",
      snufflTake: "A solid backup choice when nothing else fits.",
      pros: ["Reliable", "Decent specs"],
      cons: ["Not the cheapest"],
      smartRating: "4.2⭐"
    }
  }
}
