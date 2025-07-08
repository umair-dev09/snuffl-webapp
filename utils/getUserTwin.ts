import { supabase } from '@/lib/supabase'

export type UserTwin = {
  user_id: string
  gender?: string
  pincode?: string
  preferred_colors?: string[]
  preferred_brands?: string[]
  dislikes?: string[]
  styles?: string[]
  budget_range?: [number, number]
  persona?: string
}

export async function getUserTwin(userId: string): Promise<UserTwin> {
  const { data, error } = await supabase
    .from('user_ai_twin')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    console.warn("No AI twin found for user:", userId)
    return {
      user_id: userId,
      preferred_colors: [],
      preferred_brands: [],
      dislikes: [],
      styles: [],
      budget_range: [0, 999999]
    }
  }

  return {
    user_id: userId,
    gender: data.gender ?? 'unspecified',
    pincode: data.pincode ?? '000000',
    preferred_colors: data.favorite_colors ?? [],
    preferred_brands: data.preferred_brands ?? [],
    dislikes: data.dislikes ?? [],
    styles: data.styles ?? [],
    budget_range: data.budget_range ?? [0, 999999],
    persona: data.persona ?? undefined
  }
}
