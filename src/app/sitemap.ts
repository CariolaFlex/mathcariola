import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://mathcariola.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const modules = [
    { path: '/funciones',     priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/calculo',       priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/algebra-lineal', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/edo',           priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/estadistica',   priority: 0.8, changeFrequency: 'monthly' as const },
  ]

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    ...modules.map(({ path, priority, changeFrequency }) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    })),
  ]
}
