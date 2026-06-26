import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://agroexchange.gr'
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/contact', '/help', '/blog', '/terms', '/privacy', '/security', '/careers'],
        disallow: ['/api/', '/auth/', '/email-confirmed'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
