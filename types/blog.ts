export type BlogStatus = 'draft' | 'published' | 'archived'

export interface Blog {
  id: string
  title: string
  slug: string
  category: string
  read_time: number
  excerpt: string | null
  content: string
  author_name: string
  author_image: string | null
  published_at: string
  featured_image: string | null
  status: BlogStatus
  created_at: string
  updated_at: string
}
