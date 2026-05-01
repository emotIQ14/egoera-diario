import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 3600;

/**
 * Forma simplificada que consume la pantalla /lecturas.
 * Mantenemos una superficie pequeña para no acoplarnos al esquema completo de WP.
 */
export type LecturaPost = {
  id: number;
  title: string;
  slug: string;
  link: string;
  excerpt: string;
  date: string;
  categories: string[];
  readingMinutes: number;
};

type LecturasResponse = {
  posts: LecturaPost[];
  fallback?: boolean;
};

type WpRendered = { rendered: string };

type WpTerm = {
  id: number;
  name: string;
  slug: string;
  taxonomy: string;
};

type WpEmbedded = {
  'wp:term'?: WpTerm[][];
};

type WpPost = {
  id: number;
  slug: string;
  link: string;
  date: string;
  title: WpRendered;
  excerpt: WpRendered;
  content: WpRendered;
  _embedded?: WpEmbedded;
};

const WP_ENDPOINT =
  'https://egoera.es/wp-json/wp/v2/posts?per_page=12&_embed=true';

const FALLBACK_POSTS: LecturaPost[] = [
  {
    id: 1001,
    title: 'Rumiación mental: cómo dejar de pensar demasiado',
    slug: 'rumiacion-mental-pensar-demasiado',
    link: 'https://egoera.es/rumiacion-mental-pensar-demasiado/',
    excerpt:
      'La rumiación es ese bucle mental que repite escenas y agota. Cómo identificarla y herramientas concretas para salir.',
    date: '2026-04-15T08:00:00',
    categories: ['Ansiedad'],
    readingMinutes: 6,
  },
  {
    id: 1002,
    title: 'El crítico interno: cómo trabajarlo en 2026',
    slug: 'critico-interno-2026-w18',
    link: 'https://egoera.es/critico-interno-2026-w18/',
    excerpt:
      'Esa voz que te juzga no eres tú. Cómo escucharla con distancia y reescribir su guion sin pelearte con ella.',
    date: '2026-04-22T08:00:00',
    categories: ['Autoestima'],
    readingMinutes: 7,
  },
  {
    id: 1003,
    title: 'Comunicación No Violenta: los 4 pasos esenciales',
    slug: 'comunicacion-no-violenta-4-pasos',
    link: 'https://egoera.es/comunicacion-no-violenta-4-pasos/',
    excerpt:
      'Observación, sentimiento, necesidad y petición. La estructura que cambia conversaciones difíciles.',
    date: '2026-04-08T08:00:00',
    categories: ['Relaciones'],
    readingMinutes: 8,
  },
  {
    id: 1004,
    title: 'Cómo superar el apego ansioso',
    slug: 'como-superar-apego-ansioso',
    link: 'https://egoera.es/como-superar-apego-ansioso/',
    excerpt:
      'El apego ansioso se aprende y también se desaprende. Una guía honesta sobre regulación emocional en pareja.',
    date: '2026-04-01T08:00:00',
    categories: ['Apego'],
    readingMinutes: 9,
  },
  {
    id: 1005,
    title: 'Dependencia emocional: 10 signos para reconocerla',
    slug: 'dependencia-emocional-10-signos',
    link: 'https://egoera.es/dependencia-emocional-10-signos/',
    excerpt:
      'Necesitar al otro no es lo mismo que depender. Diez señales que ayudan a distinguirlo y a empezar a soltar.',
    date: '2026-03-25T08:00:00',
    categories: ['Relaciones'],
    readingMinutes: 6,
  },
];

/**
 * Quita etiquetas HTML, decodifica entidades básicas y limita longitud.
 * No depende de DOMParser para que funcione en runtime Node.
 */
function stripHtml(input: string, maxLength = 100): string {
  if (!input) return '';
  const noTags = input.replace(/<[^>]*>/g, ' ');
  const decoded = noTags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&hellip;/g, '…')
    .replace(/&[a-z]+;/gi, ' ');
  const collapsed = decoded.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= maxLength) return collapsed;
  return `${collapsed.slice(0, maxLength).trimEnd()}…`;
}

function plainText(input: string): string {
  if (!input) return '';
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeTitle(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function readingMinutesFromContent(html: string): number {
  const text = plainText(html);
  if (!text) return 1;
  return Math.max(1, Math.ceil(text.length / 1500));
}

function categoriesFromEmbedded(post: WpPost): string[] {
  const groups = post._embedded?.['wp:term'];
  if (!Array.isArray(groups)) return [];
  const cats = groups
    .flat()
    .filter((t): t is WpTerm => Boolean(t) && t.taxonomy === 'category')
    .map((t) => t.name)
    .filter((n) => n && n.toLowerCase() !== 'sin categoría');
  return Array.from(new Set(cats));
}

function mapPost(post: WpPost): LecturaPost {
  return {
    id: post.id,
    title: decodeTitle(post.title.rendered),
    slug: post.slug,
    link: post.link,
    excerpt: stripHtml(post.excerpt.rendered, 100),
    date: post.date,
    categories: categoriesFromEmbedded(post),
    readingMinutes: readingMinutesFromContent(post.content.rendered),
  };
}

export async function GET(_req: NextRequest): Promise<Response> {
  try {
    const wpRes = await fetch(WP_ENDPOINT, {
      headers: {
        'User-Agent': 'EgoeraDiario/1.0 (+https://egoera.es)',
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    } as RequestInit);

    if (!wpRes.ok) {
      throw new Error(`WP responded ${wpRes.status}`);
    }

    const data = (await wpRes.json()) as WpPost[];
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Empty WP response');
    }

    const posts = data.map(mapPost);
    const payload: LecturasResponse = { posts };
    return Response.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('[api/lecturas] fallback', err);
    const payload: LecturasResponse = {
      posts: FALLBACK_POSTS,
      fallback: true,
    };
    return Response.json(payload, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    });
  }
}
