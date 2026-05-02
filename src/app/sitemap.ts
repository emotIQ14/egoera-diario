import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://egoera-diario.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority: number;
  }> = [
    { path: '/', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/bienvenida', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/diario', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/conversa', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/patrones', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/lecturas', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/pro', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/tu', changeFrequency: 'monthly', priority: 0.7 },
  ];

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
