import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { PWARegister } from '@/components/ui/PWARegister'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://mathcariola.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'MathCariola — Matemáticas para Ingeniería',
    template: '%s · MathCariola',
  },
  description:
    'Plataforma interactiva de matemáticas para ingeniería: cálculo, álgebra lineal, ecuaciones diferenciales y estadística con motor CAS simbólico y graficadoras interactivas.',
  keywords: [
    'matemáticas', 'ingeniería', 'cálculo', 'álgebra lineal', 'EDO',
    'estadística', 'derivadas', 'integrales', 'matrices', 'graficadora',
    'CAS', 'solucionador', 'paso a paso',
  ],
  authors: [{ name: 'MathCariola' }],
  creator: 'MathCariola',
  publisher: 'MathCariola',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: BASE_URL,
    siteName: 'MathCariola',
    title: 'MathCariola — Matemáticas para Ingeniería',
    description:
      'Resuelve, visualiza y aprende cálculo, álgebra lineal, EDO y estadística con un motor CAS simbólico y graficadoras interactivas.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MathCariola — Matemáticas para Ingeniería',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MathCariola — Matemáticas para Ingeniería',
    description:
      'Plataforma de matemáticas para ingeniería con motor CAS simbólico.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={inter.variable}
      suppressHydrationWarning
    >
      <head>
        {/* Anti-FOUC: aplica .dark antes de que React hidrate */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
        {/* Preload KaTeX fonts críticas para evitar CLS/FOUT */}
        <link
          rel="preload"
          href="/_next/static/media/KaTeX_Main-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/_next/static/media/KaTeX_Math-Italic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-[--surface] text-[--text-primary] antialiased">
        {/* Skip to content for keyboard/screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
        >
          Ir al contenido principal
        </a>
        <ThemeProvider>{children}</ThemeProvider>
        <PWARegister />
      </body>
    </html>
  )
}
