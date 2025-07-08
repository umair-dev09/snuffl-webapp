# 🧠 Copilot Context for Snuffl AI — Shopping Assistant

This file defines all the key terms, logic flows, tech stack, and naming conventions used in the project so GitHub Copilot and other AI tools can generate more relevant suggestions.

---

## 🔧 Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Database**: Supabase (Postgres)
- **AI Models**: Google Gemini 1.5 Flash + Pro
- **Scraping**: Crawl4AI
- **UI**: Tailwind CSS + ShadCN

---

## 🛒 Core Functionality

Snuffl AI is an AI shopping assistant that:

- Takes natural language queries (e.g., *best headphones under ₹3000 for gym*)
- Parses the prompt into structured intent (category, budget, use-case)
- Fetches matching products from Supabase (or scrapes the web if not available)
- Ranks top 9 products using AI scoring logic
- Enriches each product with:
  - `snufflTake` (AI-generated 1-liner)
  - `pros`, `cons`, `smartRating`
  - `quick_specs`
- Shows them in UI cards with a “View Details” and “Buy Now” CTA

---

## 🔄 Data Flow (API `/api/search`)

```ts
User Prompt → analyzePrompt.ts
             → getUserTwin.ts (optional)
             → check Supabase for products
  if empty: → generateProductLinks.ts → fetchFromCrawl4AI.ts → store to Supabase
Then:       → scoreProducts.ts → generateAiSummary.ts → return top 9
📦 Key Files / Utils
File	Purpose
analyzePrompt.ts	Converts prompt to structured data
getUserTwin.ts	Pulls personalized preferences
generateProductLinks.ts	Gemini-powered ecommerce links
fetchFromCrawl4AI.ts	Uses Crawl4AI to scrape product data
generateAiSummary.ts	Adds snufflTake, pros/cons, specs
generateEditorPick.ts	AI-generated fallback if no results
scoreProducts.ts	Ranks results based on AI weight logic
askGemini.ts	Shared wrapper to call Gemini model
types/product.ts	Product interface (title, price, etc.)

🧠 Domain-Specific Terminology
Term	Meaning
snufflTake	1-line AI insight: “Great for gamers on a budget”
smartRating	Humanized star rating: “4.3⭐ · Loved by students”
editorPick	AI-generated fallback product
AI Twin	User profile: likes, dislikes, brands, style
Just So You Know	Honest negative facts scraped from reviews
Smart Compare	Comparison battle feature — 6 rounds per product
Buy Dialog	Best buy breakdown showing price/platform/offer

🧪 Sample Types Copilot Should Learn
ts
Copy
Edit
// types/product.ts
export type Product = {
  title: string
  price: number
  brand?: string
  features?: string[]
  color?: string
  image?: string
  link?: string
  description?: string
  source?: string
  scraped_at?: string
}

// types/prompt.ts
export type PromptAnalysis = {
  category: string
  budget?: number
  use_case?: string
  priority_features?: string[]
  user_strict_budget: boolean
}
🔧 Naming Conventions for Functions
Pattern	Meaning
generate*	AI LLM-based output
score*	Smart logic / rule-based
get*	Fetch data from user/session
fetchFrom*	Scraper / external integration
parse*	Clean or normalize data
store*	Insert into Supabase

💡 Prompt Examples for Testing
rust
Copy
Edit
best phones under 15k for content creators
affordable sunscreen for oily skin
formal shoes for interviews under 2500
gaming headphones under 3000 with mic
🧠 Future Ideas (Use this for Copilot predictions)
AI Twin gets smarter over time → dynamic preference ranking

Smart Compare will use Gemini to judge each round

Autopilot mode → “Gift something nice for my sister under ₹1k”

Voice mode and mobile PWA