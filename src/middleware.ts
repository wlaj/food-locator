import { NextRequest, NextResponse } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

const locales = ['en-US', 'en', 'nl-NL', 'nl']
const defaultLocale = 'en-US'

function getLocale(request: NextRequest): string {
  const acceptLanguageHeader = request.headers.get('accept-language')
  if (!acceptLanguageHeader) return defaultLocale

  const headers = { 'accept-language': acceptLanguageHeader }
  const languages = new Negotiator({ headers }).languages()
  
  return match(languages, locales, defaultLocale)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return
  }

  const locale = getLocale(request)
  
  // Store the detected locale in a cookie for consistency
  const response = NextResponse.next()
  response.cookies.set('locale', locale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  return response
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico).*)',
  ],
}