export interface Product {
  id: string
  title: string
  price: number
  image: string
  link: string
  brand: string
  color?: string
  features?: string[]
  description?: string
  source: string
  scraped_at: string
}
