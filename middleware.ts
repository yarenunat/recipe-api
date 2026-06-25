import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ['tr', 'en', 'zh', 'hi', 'es'];
const defaultLocale = 'tr';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Exclude static files, API routes, Next.js internals, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // like favicon.ico, manifest.json
  ) {
    return NextResponse.next();
  }

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
 
  if (pathnameHasLocale) {
    return NextResponse.next();
  }
 
  // Redirect if there is no locale
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}
 
export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)',
  ],
};
