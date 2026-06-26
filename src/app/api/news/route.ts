import { NextResponse } from 'next/server'
import { fetchNews } from '@/services/news'

export const revalidate = 3600 // 1 hour

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') ?? undefined
  const articles  = await fetchNews(category)
  return NextResponse.json({ data: articles })
}
