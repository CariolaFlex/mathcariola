import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'MathCariola',
    template: '%s · MathCariola',
  },
  description:
    'Plataforma de matemáticas para ingeniería — cálculo, álgebra lineal, EDO y más.',
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
        {/* Script anti-FOUC: aplica .dark antes de que React hidrate */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />

        {/*
          Preload de fuentes KaTeX críticas para evitar CLS/FOUT.
          mathlive/fonts.css ya declara @font-face con font-display:swap,
          pero el preload explícito asegura que las fuentes más usadas
          se descarguen en paralelo con el resto de recursos.
        */}
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
