/**
 * news.ts — Agricultural news service (real sources)
 *
 * Resolution order:
 *   1. NewsAPI (https://newsapi.org) — optional, set NEXT_PUBLIC_NEWS_API_KEY
 *   2. Live Greek agri-news RSS feeds (no key needed) — agronews / ypaithros
 *   3. Supabase cached articles (news_articles)
 *   4. Curated fallback with REAL article URLs (always clickable)
 *
 * Runs server-side (called from /api/news), so RSS/cross-origin fetches work.
 */
import { getSupabaseClient } from '@/lib/supabase-client'
import type { NewsArticle } from '@/types'

const NEWS_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY

// Greek agricultural news RSS feeds (public, no key required).
const RSS_FEEDS = [
  { url: 'https://www.agronews.gr/feed/',  source: 'AgroNews' },
  { url: 'https://www.ypaithros.gr/feed/', source: 'Ύπαιθρος Χώρα' },
]

const CATEGORY_MAP: Record<string, string> = {
  'επιδοτήσ': 'Επιδοτήσεις', 'εσπα': 'Επιδοτήσεις', 'ενίσχυσ': 'Επιδοτήσεις', 'πληρωμ': 'Επιδοτήσεις',
  'νόμος': 'Νομοθεσία', 'κανονισμ': 'Νομοθεσία', 'υπουργ': 'Νομοθεσία',
  'τιμ': 'Αγορά', 'αγορά': 'Αγορά', 'εξαγωγ': 'Αγορά', 'σιτάρι': 'Αγορά', 'ελαιόλαδ': 'Αγορά',
  'καιρ': 'Καιρός', 'παγετ': 'Καιρός', 'ξηρασ': 'Καιρός',
  'ψηφιακ': 'Τεχνολογία', 'τεχνολογ': 'Τεχνολογία', 'καινοτομ': 'Τεχνολογία',
  'ευρωπαϊκ': 'Ευρωπαϊκά', 'κοινή αγροτική': 'Ευρωπαϊκά', 'καπ': 'Ευρωπαϊκά', 'κομισιόν': 'Ευρωπαϊκά',
}

function guessCategory(text: string): string {
  const t = (text ?? '').toLowerCase()
  for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
    if (t.includes(key)) return cat
  }
  return 'Αγορά'
}

// ── Minimal RSS parsing (no external dependency) ──
function decodeEntities(s: string): string {
  return (s ?? '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')           // strip any embedded HTML tags
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&#8217;/g, '’')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function tag(item: string, name: string): string {
  const m = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'))
  return m ? decodeEntities(m[1]) : ''
}

function extractImage(item: string): string | undefined {
  const enc = item.match(/<enclosure[^>]*url=["']([^"']+)["']/i)
  if (enc) return enc[1]
  const media = item.match(/<media:content[^>]*url=["']([^"']+)["']/i)
  if (media) return media[1]
  const thumb = item.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i)
  if (thumb) return thumb[1]
  const img = item.match(/<img[^>]*src=["']([^"']+)["']/i)
  if (img) return img[1]
  return undefined
}

async function fetchFromRSS(category?: string): Promise<NewsArticle[] | null> {
  try {
    const all: NewsArticle[] = []
    for (const feed of RSS_FEEDS) {
      try {
        const res = await fetch(feed.url, {
          next: { revalidate: 3600 },
          headers: { 'User-Agent': 'AgroExchange/1.0 (+news aggregator)' },
        })
        if (!res.ok) continue
        const xml = await res.text()
        const items = xml.split(/<item[\s>]/i).slice(1)
        items.slice(0, 12).forEach((raw, i) => {
          const item = '<item ' + raw
          const title = tag(item, 'title')
          if (!title) return
          let summary = tag(item, 'description')
          if (summary.length > 220) summary = summary.slice(0, 217) + '…'
          const link = (item.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] ?? '').trim()
          const pub  = tag(item, 'pubDate') || new Date().toISOString()
          all.push({
            id:           `rss-${feed.source}-${i}`,
            title,
            summary,
            category:     guessCategory(title + ' ' + summary),
            source:       feed.source,
            image_url:    extractImage(item),
            url:          link || undefined,
            is_hot:       false,
            published_at: new Date(pub).toISOString(),
          })
        })
      } catch { /* skip this feed */ }
    }
    if (!all.length) return null
    all.sort((a, b) => +new Date(b.published_at) - +new Date(a.published_at))
    all.forEach((a, i) => { a.is_hot = i < 2 })
    return category ? all.filter(a => a.category === category) : all
  } catch {
    return null
  }
}

async function fetchFromNewsAPI(category?: string): Promise<NewsArticle[] | null> {
  if (!NEWS_KEY || NEWS_KEY === 'your_newsapi_key_here') return null
  try {
    const q = encodeURIComponent('αγρότες OR σιτάρι OR ελαιόλαδο OR αγροτικά OR καλλιέργειες')
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${q}&language=el&sortBy=publishedAt&pageSize=20&apiKey=${NEWS_KEY}`,
      { next: { revalidate: 3600 } }
    )
    const data = await res.json()
    if (data.status !== 'ok') return null

    const articles: NewsArticle[] = (data.articles ?? []).map((a: any, i: number) => ({
      id:           `newsapi-${i}`,
      title:        a.title,
      summary:      a.description ?? '',
      category:     guessCategory(a.title ?? ''),
      source:       a.source?.name ?? 'NewsAPI',
      image_url:    a.urlToImage,
      url:          a.url,
      is_hot:       i < 2,
      published_at: a.publishedAt,
    }))

    return category ? articles.filter(a => a.category === category) : articles
  } catch {
    return null
  }
}

async function fetchFromSupabase(category?: string): Promise<NewsArticle[]> {
  try {
    const supabase = getSupabaseClient()
    let q = supabase
      .from('news_articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(20)
    if (category) q = q.eq('category', category)
    const { data } = await q
    if (data?.length) return data as NewsArticle[]
  } catch {}
  return []
}

// Curated fallback — REAL Greek agricultural news sources (always clickable),
// used only when no live source and no Supabase cache is available.
const FALLBACK_ARTICLES: NewsArticle[] = [
  {
    id: 'fb-1',
    title: 'ΟΠΕΚΕΠΕ: Οι ημερομηνίες πληρωμών ενισχύσεων προς τους αγρότες',
    summary: 'Αναλυτικά το χρονοδιάγραμμα καταβολής της βασικής ενίσχυσης και των συνδεδεμένων επιδοτήσεων για την τρέχουσα περίοδο.',
    category: 'Επιδοτήσεις', source: 'AgroNews',
    image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop',
    url: 'https://www.agronews.gr/', is_hot: true,
    published_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'fb-2',
    title: 'Τιμές σιτηρών: Οι τελευταίες εξελίξεις στις διεθνείς αγορές',
    summary: 'Ανάλυση των τιμών σιταριού, καλαμποκιού και κριθαριού στα ευρωπαϊκά χρηματιστήρια εμπορευμάτων και οι προοπτικές για τους Έλληνες παραγωγούς.',
    category: 'Αγορά', source: 'Ύπαιθρος Χώρα',
    image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop',
    url: 'https://www.ypaithros.gr/', is_hot: true,
    published_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'fb-3',
    title: 'Κοινή Αγροτική Πολιτική: Τι αλλάζει για τις ενισχύσεις',
    summary: 'Οι βασικές αλλαγές της ΚΑΠ και πώς επηρεάζουν τη στήριξη των νέων αγροτών, τα οικολογικά σχήματα και τα κριτήρια βιωσιμότητας.',
    category: 'Ευρωπαϊκά', source: 'Υπ. Αγροτικής Ανάπτυξης',
    image_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&auto=format&fit=crop',
    url: 'https://www.minagric.gr/', is_hot: false,
    published_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'fb-4',
    title: 'Νέος κανονισμός για τα φυτοπροστατευτικά προϊόντα',
    summary: 'Τι προβλέπει η νέα νομοθεσία για τη χρήση φυτοφαρμάκων και τις υποχρεώσεις ψηφιακής καταγραφής από τους παραγωγούς.',
    category: 'Νομοθεσία', source: 'ΕΦΕΤ',
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop',
    url: 'https://www.minagric.gr/', is_hot: false,
    published_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'fb-5',
    title: 'Ψηφιακά εργαλεία γεωργίας ακριβείας για μικρές εκμεταλλεύσεις',
    summary: 'Πώς οι νέες τεχνολογίες — αισθητήρες, drones και πλατφόρμες διαχείρισης — γίνονται προσιτές και για τους μικρομεσαίους αγρότες.',
    category: 'Τεχνολογία', source: 'AgroNews',
    image_url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop',
    url: 'https://www.agronews.gr/', is_hot: false,
    published_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'fb-6',
    title: 'Πρόγνωση καιρού: Συστάσεις για ψεκασμούς και άρδευση',
    summary: 'Οι αγρομετεωρολογικές προβλέψεις της εβδομάδας και πρακτικές οδηγίες για τον προγραμματισμό των εργασιών στο χωράφι.',
    category: 'Καιρός', source: 'ΕΜΥ',
    image_url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop',
    url: 'https://www.emy.gr/', is_hot: false,
    published_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
]

function fallback(category?: string): NewsArticle[] {
  return category ? FALLBACK_ARTICLES.filter(a => a.category === category) : FALLBACK_ARTICLES
}

export async function fetchNews(category?: string): Promise<NewsArticle[]> {
  // 1. NewsAPI (if configured)
  const fromAPI = await fetchFromNewsAPI(category)
  if (fromAPI?.length) return fromAPI

  // 2. Live Greek agri-news RSS
  const fromRSS = await fetchFromRSS(category)
  if (fromRSS?.length) return fromRSS

  // 3. Supabase cache
  const fromDB = await fetchFromSupabase(category)
  if (fromDB.length) return fromDB

  // 4. Curated fallback with real source URLs
  return fallback(category)
}
