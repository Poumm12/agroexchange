import { NextResponse } from 'next/server'
import { fetchWeather } from '@/services/weather'

export const revalidate = 1800 // 30 minutes

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const city = searchParams.get('city') ?? 'Larissa,GR'
  const data = await fetchWeather(city)
  return NextResponse.json({ data })
}
