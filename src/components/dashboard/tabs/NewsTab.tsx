'use client'
import { useState, useEffect } from 'react'
import type { NewsArticle } from '@/types'
import { Card, Badge, Spinner } from '@/components/ui'
import { Icons } from '@/components/ui/Icons'
import { formatDistanceToNow } from 'date-fns'
import { el } from 'date-fns/locale'

const CATEGORIES = ['Όλα','Επιδοτήσεις','Αγορά','Νομοθεσία','Ευρωπαϊκά','Τεχνολογία','Καιρός']

const CAT_COLOR: Record<string,string> = {
  'Επιδοτήσεις': 'bg-green-100 text-green-700',
  'Αγορά':       'bg-blue-100 text-blue-700',
  'Νομοθεσία':   'bg-amber-100 text-amber-700',
  'Ευρωπαϊκά':   'bg-purple-100 text-purple-700',
  'Τεχνολογία':  'bg-cyan-100 text-cyan-700',
  'Καιρός':      'bg-sky-100 text-sky-700',
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&auto=format&fit=crop&q=80'

export function NewsTab() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading]   = useState(true)
  const [cat, setCat]           = useState('Όλα')
  const [isDemo, setIsDemo]     = useState(false)

  useEffect(() => { load() }, [cat])

  async function load() {
    setLoading(true)
    try {
      const params = cat !== 'Όλα' ? `?category=${encodeURIComponent(cat)}` : ''
      const res  = await fetch(`/api/news${params}`)
      const json = await res.json()
      setArticles(json.data ?? [])
      setIsDemo(!json.data?.length || json.data?.[0]?.source === '')
    } catch {
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  const featured = articles[0]
  const rest     = articles.slice(1)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-extrabold text-gray-900 text-xl tracking-tight">Νέα & Ενημερώσεις</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {isDemo ? 'Supabase cached · Προσθέστε NEWS_API_KEY για live ειδήσεις' : 'Live ειδήσεις'}
          </p>
        </div>
        {isDemo && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 flex items-center gap-2">
            <Icons.alert className="w-3.5 h-3.5 flex-shrink-0" />
            Προσθέστε NEXT_PUBLIC_NEWS_API_KEY για αυτόματες ειδήσεις
          </div>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              cat === c ? 'bg-agro-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-agro-300 hover:text-agro-700'
            }`}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Icons.newspaper className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Δεν βρέθηκαν άρθρα</p>
        </div>
      ) : (
        <>
          {/* Featured article */}
          {featured && cat === 'Όλα' && (
            <Card hover className="overflow-hidden md:flex">
              <div className="md:w-2/5 h-48 md:h-auto flex-shrink-0 overflow-hidden">
                <img
                  src={featured.image_url || FALLBACK_IMAGE}
                  alt={featured.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}
                />
              </div>
              <div className="p-6 flex flex-col justify-center">
                <div className="flex gap-2 mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CAT_COLOR[featured.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {featured.category}
                  </span>
                  {featured.is_hot && <Badge variant="danger">Trending</Badge>}
                </div>
                <h3 className="font-display font-extrabold text-gray-900 text-xl leading-tight mb-3 tracking-tight line-clamp-3">
                  {featured.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">{featured.summary}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Icons.newspaper className="w-3 h-3" />{featured.source}</span>
                  <span className="flex items-center gap-1">
                    <Icons.calendar className="w-3 h-3" />
                    {formatDistanceToNow(new Date(featured.published_at), { addSuffix: true, locale: el })}
                  </span>
                  <span className="flex items-center gap-1"><Icons.eye className="w-3 h-3" />{Math.floor(Math.random()*6)+2} λεπτά</span>
                </div>
                {featured.url && featured.url !== '#' && (
                  <a href={featured.url} target="_blank" rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-agro-700 hover:text-agro-900 transition-colors">
                    Διάβασε περισσότερα <Icons.link className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </Card>
          )}

          {/* Article grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(cat === 'Όλα' ? rest : articles).map(a => (
              <Card key={a.id} hover className="overflow-hidden flex flex-col">
                <div className="h-40 overflow-hidden flex-shrink-0 relative">
                  <img
                    src={a.image_url || FALLBACK_IMAGE}
                    alt={a.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${CAT_COLOR[a.category] ?? 'bg-gray-100 text-gray-600'}`}>
                      {a.category}
                    </span>
                    {a.is_hot && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/90 text-white backdrop-blur-sm">
                        Trending
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-3 flex-1 mb-3">
                    {a.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1"><Icons.newspaper className="w-3 h-3" />{a.source || 'AgroExchange'}</span>
                    <span className="flex items-center gap-1">
                      <Icons.calendar className="w-3 h-3" />
                      {formatDistanceToNow(new Date(a.published_at), { addSuffix: true, locale: el })}
                    </span>
                  </div>
                  {a.url && a.url !== '#' && (
                    <a href={a.url} target="_blank" rel="noopener noreferrer"
                      className="mt-3 text-xs font-semibold text-agro-700 hover:underline flex items-center gap-1">
                      Περισσότερα <Icons.link className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
