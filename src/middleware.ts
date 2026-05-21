/**
 * Edge middleware: redirect *.vercel.app → diario.egoera.es (dominio canónico).
 *
 * Mantiene localhost intacto para desarrollo. Cualquier otro host pasa sin tocar.
 * Mejor para SEO que un mirror (evita duplicate content) y mejor que un redirect
 * configurado en panel porque está versionado en git.
 */

import { NextResponse, type NextRequest } from 'next/server';

const CANONICAL_HOST = 'diario.egoera.es';

export function middleware(request: NextRequest): NextResponse {
  const host = request.headers.get('host') ?? '';

  // Solo intervenimos si el host es vercel.app (el .vercel.app del proyecto u otros previews)
  if (host.endsWith('.vercel.app')) {
    const url = request.nextUrl.clone();
    url.host = CANONICAL_HOST;
    url.protocol = 'https:';
    url.port = '';
    return NextResponse.redirect(url, 308); // 308 Permanent — preserva método HTTP
  }

  return NextResponse.next();
}

export const config = {
  // No interceptar assets estáticos ni rutas internas de Next
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons/|peeps/|.*\\..*).*)',
  ],
};
