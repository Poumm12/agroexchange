import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://agroexchange.gr'
  const now  = new Date()

  const staticPages = [
    { url: base,           priority: 1.0,  changeFrequency: 'daily'   as const },
    { url: `${base}/about`,     priority: 0.7,  changeFrequency: 'monthly' as const },
    { url: `${base}/contact`,   priority: 0.6,  changeFrequency: 'monthly' as const },
    { url: `${base}/help`,      priority: 0.8,  changeFrequency: 'weekly'  as const },
    { url: `${base}/terms`,     priority: 0.4,  changeFrequency: 'yearly'  as const },
    { url: `${base}/privacy`,   priority: 0.4,  changeFrequency: 'yearly'  as const },
    { url: `${base}/security`,  priority: 0.5,  changeFrequency: 'monthly' as const },
    { url: `${base}/careers`,   priority: 0.6,  changeFrequency: 'weekly'  as const },
    { url: `${base}/blog`,      priority: 0.7,  changeFrequency: 'weekly'  as const },
  ]

  return staticPages.map(p => ({ ...p, lastModified: now }))
}
