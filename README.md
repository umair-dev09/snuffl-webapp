# 🦊 Snuffl AI — Hyper-Personalized AI Shopping Assistant

Snuffl AI is your Gen-Z-inspired, AI-powered shopping companion that radically simplifies product discovery by delivering **hyper-personalized**, **unbiased**, and **contextual shopping suggestions** using generative AI and real-time ecommerce scraping.

---

## 🚀 What Problem Are We Solving?

Online shoppers (especially in India) waste **a lot of time**:

- Filtering through endless listings on Amazon, Flipkart, etc.
- Watching 10+ YouTube videos for honest reviews
- Searching Reddit, Quora, blogs for unbiased opinions
- Still ending up **confused** about what to buy

💡 **Snuffl AI** fixes this by becoming your intelligent personal shopper who:
- Understands your **intent**, **budget**, **lifestyle**, and **style**
- Finds the most relevant 9 products in 3 seconds
- Summarizes pros, cons, and who it's best for
- Lets you compare products in a fun & interactive Smart Compare battle
- Always gives you honest feedback (even if it means “Don’t buy this”)

---

## 🧠 MVP Features

- ✨ **Chat-powered search** — users just type:  
  `"Best wired headphones for editing under ₹2k"`
- 🔍 **Top 9 Results** — smartly scored, ranked, and visualized
- 🧠 **Snuffl's Take** — personalized summary for each product
- ✅ **Pros & Cons** — AI-analyzed from specs & reviews
- 🎯 **Smart Rating** — human-style sentiment scoring (e.g., “4.5⭐ Loved by gamers”)
- 💡 **Just So You Know...** — AI-pulled common regrets about the product
- 📦 **Buy Dialog** — shows best platform to buy with offer breakdown
- ⚔️ **Smart Compare Mode** — battle-style comparison of 2–4 products across 6 rounds
- 🔄 **Editor Pick Fallback** — when no product matches, generate one using AI

---

## 📦 Product Architecture

User Prompt
⬇
[Analyze Prompt] → extract category, budget, features
⬇
[Supabase Check] → see if we have matching products
⬇
✅ If Yes → Rank, Summarize, Return Top 9
❌ If No →
⬇
[Gemini] → Get product links
⬇
[Crawl4AI] → Scrape product pages
⬇
[Supabase] → Store structured data
⬇
[Score + AI Summary] → Return Top 9 with deep AI insights

yaml
Copy
Edit

---

## ⚙️ Tech Stack

| Tech         | Usage |
|--------------|-------|
| **Next.js (App Router)** | Frontend + API routes |
| **TypeScript** | Full type safety |
| **Supabase** | Auth, DB, product storage, logs |
| **Google Gemini 2.5** | All AI/LLM logic (summaries, scoring, fallback, etc.) |
| **Crawl4AI** | Scrapes ecommerce product data |
| **Tailwind CSS** | UI styling |
| **Lottie** | Animated mascot & transitions |
| **ShadCN** | UI components (modals, cards) |

---

## 🧬 AI Architecture (LLM Pipeline)

We use **Google Gemini 2.5 Pro & Flash** for:

| Task | File | Model |
|------|------|-------|
| 🎯 Prompt Analysis | `analyzePrompt.ts` | gemini-1.5-flash |
| 🔗 Product Link Generator | `generateProductLinks.ts` | gemini-1.5-pro |
| 🧠 Product Summary + Snuffl’s Take | `generateAiSummary.ts` | gemini-1.5-pro |
| 🧰 Editor Pick Fallback | `generateEditorPick.ts` | gemini-1.5-pro |
| ⚖️ Smart Score Engine | `scoreProducts.ts` | Custom logic |
| 🧠 AI Twin | `getUserTwin.ts` | Personalization |

---

## 📁 Project Structure

snuffl-ai/
├── app/ → Next.js app router pages
│ ├── api/search/ → Main POST route for product search
│ └── (other screens) → Home, Compare, Onboarding, etc.
├── lib/
│ ├── askGemini.ts → Gemini wrapper
│ ├── fetchFromCrawl4AI.ts → Call crawl4ai
│ ├── gptLinkGenerator.ts → Gemini-powered product links
│ └── supabase.ts → Supabase client
├── utils/
│ ├── analyzePrompt.ts
│ ├── generateAiSummary.ts
│ ├── generateEditorPick.ts
│ ├── scoreProducts.ts
│ └── getUserTwin.ts
├── types/
│ ├── product.ts
│ ├── prompt.ts
│ └── userTwin.ts
├── public/
│ └── mascot assets, icons, logos
├── .env.local → API keys
└── README.md → This file

yaml
Copy
Edit

---

## 🔐 ENV Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Gemini AI
GEMINI_API_KEY=...

# Crawl4AI
CRAWL4AI_API_KEY=...

# Optional analytics, Sentry, etc.
🧪 How to Test the MVP
Run dev server:
pnpm dev or npm run dev

Use the homepage chatbox:

bash
Copy
Edit
Best headphones under ₹3000 for gym
Observe:

9 cards rendered

"View Details" → deep AI view

"Smart Compare" → add 2+ → comparison

💸 Affiliate Revenue
Each Buy Now button links to the best ecommerce site using affiliate links

Supported: Amazon, Flipkart, Croma

More programs to be added

💥 Future Features
🧠 AI Twin Evolution → like a pet that grows with your preferences

🎁 Auto Purchase Mode → "Buy something cool for my sister's birthday"

🎧 Voice Mode → Ask product queries in Hindi or English

📊 Analytics & Dashboard for admin

🤝 Social Shopping — public wishlists, comment reactions

🤖 Copilot Tips
All utils are self-contained + typed

Files include structured inputs and expected outputs

askGemini() handles all AI requests — documented for Copilot

🧑‍💻 Author
Umair Shaikh
Founder, Developer, and Dreamer of Snuffl AI
🛒 Turning chaos of online shopping into clarity with AI.