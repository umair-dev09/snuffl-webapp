import { UserTwin } from './getUserTwin'
import { PromptAnalysis } from  './analyzePrompt'

type Product = {
  id: string
  title: string
  brand?: string
  color?: string
  price: number
  category: string
  features?: string[] // ["headrest", "adjustable", "mesh"]
}

type ScoredProduct = Product & {
  matchType: "exact" | "smartFit" | "partialFit"
  score: number
}

export function scoreProducts(
  products: Product[],
  prompt: PromptAnalysis,
  twin?: UserTwin
): ScoredProduct[] {
  const scored: ScoredProduct[] = []

  for (const p of products) {
    let score = 0
    let matchType: "exact" | "smartFit" | "partialFit" = "partialFit"

    // 🎯 1. Match category (mandatory)
    if (p.category?.toLowerCase().includes(prompt.category?.toLowerCase() || '')) {
      score += 20
    }

    // 💰 2. Budget + Upsell logic
    const isUnderBudget = prompt.budget && p.price <= prompt.budget
    const isUpsell = prompt.budget && p.price > prompt.budget && p.price <= prompt.budget * 1.5

    if (isUnderBudget) {
      score += 20
      matchType = "exact"
    } else if (isUpsell) {
      score += 15 // still relevant
      matchType = "smartFit"
    } else {
      score -= 15
    }

    // 🧩 3. Feature Matching
    const featureMatches = prompt.priority_features?.filter(f => p.features?.includes(f)) || []
    if (featureMatches.length > 0) {
      score += 15
      if (matchType === "exact") matchType = "exact"
      else if (isUpsell) matchType = "smartFit"
    } else {
      if (prompt.priority_features?.length) score -= 5
    }

    // 👤 4. AI Twin Matching
    if (twin) {
      if (twin.preferred_colors?.includes(p.color || '')) score += 5
      if (twin.preferred_brands?.includes(p.brand || '')) score += 10
      if (twin.dislikes?.some(d => p.title.toLowerCase().includes(d.toLowerCase()))) {
        score -= 20
      }
    }

    // 🔎 5. Use Case Matching (e.g. "for gym")
    if (prompt.use_case && p.title.toLowerCase().includes(prompt.use_case)) {
      score += 5
    }

    scored.push({
      ...p,
      score,
      matchType
    })
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 9) // Top 9
}
