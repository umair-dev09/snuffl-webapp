import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function askGemini({
  prompt,
  system,
  model = 'gemini-1.5-flash',
  temperature = 0.5,
  maxTokens = 2048
}: {
  prompt: string
  system?: string
  model?: 'gemini-1.5-flash' | 'gemini-1.5-pro'
  temperature?: number
  maxTokens?: number
}): Promise<string> {
  try {
    const instance = genAI.getGenerativeModel({ 
      model,
      systemInstruction: system
    })
    const result = await instance.generateContent({
      contents: [
        { role: 'user', parts: [{ text: prompt }] }
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens
      }
    })

    return result.response.text()
  } catch (err) {
    console.error('Gemini error:', err)
    return ''
  }
}
