import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
    }
  }
  interface User {
    id: string
    email: string
    name?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }
}

export interface Post {
  id: string
  title: string
  content: string
  summary?: string | null
  coverImage?: string | null
  videoUrl?: string | null
  published: boolean
  viewCount: number
  createdAt: Date
  updatedAt: Date
  authorId: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  coverImage?: string | null
  images: string
  videoUrl?: string | null
  published: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: string
  content: string
  nickname?: string | null
  createdAt: Date
  postId?: string | null
  productId?: string | null
  userId?: string | null
}