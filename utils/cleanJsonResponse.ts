// utils/cleanJsonResponse.ts

/**
 * Cleans Gemini AI response by removing markdown code blocks
 * and extracts valid JSON content
 */
export function cleanJsonResponse(response: string): string {
  return response
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .replace(/^[\s\n]*/, '') // Remove leading whitespace/newlines
    .replace(/[\s\n]*$/, '') // Remove trailing whitespace/newlines
    .trim()
}

/**
 * Safely parses JSON from Gemini response with cleaning
 */
export function parseJsonResponse(response: string, fallback: any = {}): any {
  try {
    const cleaned = cleanJsonResponse(response)
    return JSON.parse(cleaned || JSON.stringify(fallback))
  } catch (error) {
    console.error('Failed to parse JSON response:', error)
    console.error('Raw response:', response)
    return fallback
  }
}
