import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import { LocaleProvider } from '@/context/LocaleContext'
import { AIAssistant } from '@/components/assistant/AIAssistant'
import { Localizer } from '@/components/Localizer'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://agroexchange.gr'

export const viewport: Viewport = {
  themeColor: '#2E7D32',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'AgroExchange – Ψηφιακή Αγορά Αγροτικών Προϊόντων',
    template: '%s | AgroExchange',
  },
  description: 'Η ψηφιακή αγορά σύνδεσης παραγωγών, αγοραστών και μεταφορέων αγροτικών προϊόντων στην Ελλάδα. Live τιμές, αγγελίες, μεταφορές.',
  keywords: ['αγροτικά προϊόντα', 'αγορά', 'σιτάρι', 'ελαιόλαδο', 'καλαμπόκι', 'παραγωγοί', 'Ελλάδα', 'αγρότες', 'agroexchange'],
  authors:   [{ name: 'AgroExchange', url: SITE_URL }],
  creator:   'AgroExchange',
  publisher: 'AgroExchange',
  icons: {
    icon:       [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut:   '/favicon.svg',
    apple:      '/apple-touch-icon.png',
  },
  openGraph: {
    title:       'AgroExchange – Ψηφιακή Αγορά Αγροτικών Προϊόντων',
    description: 'Σύνδεση παραγωγών, αγοραστών και μεταφορέων αγροτικών προϊόντων στην Ελλάδα.',
    url:         SITE_URL,
    siteName:    'AgroExchange',
    locale:      'el_GR',
    type:        'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AgroExchange' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'AgroExchange',
    description: 'Η ψηφιακή αγορά αγροτικών προϊόντων',
    images:      ['/og-image.png'],
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: SITE_URL },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <LocaleProvider>
            {children}
            <AIAssistant />
            <Localizer />
          </LocaleProvider>
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize:   '14px',
              borderRadius: '12px',
              maxWidth:   '380px',
            },
            success: { style: { background: '#E8F5E9', color: '#1B5E20', border: '1px solid #C8E6C9' } },
            error:   { style: { background: '#FFEBEE', color: '#B71C1C', border: '1px solid #FFCDD2' } },
          }}
        />
      </body>
    </html>
  )
}
