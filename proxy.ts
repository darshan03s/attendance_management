import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getUserById } from './db/utils'

const isPublicRoute = createRouteMatcher(['/auth(.*)'])
const isApiRoute = createRouteMatcher(['/api(.*)'])
const isOnboardingRoute = createRouteMatcher(['/onboarding'])

export default clerkMiddleware(async (auth, request) => {
  const { isAuthenticated, userId } = await auth()

  // Public routes: redirect authenticated users to home
  if (isPublicRoute(request)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return
  }

  // Unauthenticated users: block API, redirect others to auth
  if (!isAuthenticated) {
    if (isApiRoute(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Allow API routes through without DB check (the API handles its own logic)
  if (isApiRoute(request)) {
    const headers = new Headers(request.headers)
    headers.set('x-user-id', userId)
    return NextResponse.next({ request: { headers } })
  }

  // Check if user exists in DB (has completed onboarding)
  const existingUser = await getUserById(userId)

  // User hasn't chosen a role yet — redirect to /onboarding
  if (!existingUser && !isOnboardingRoute(request)) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  // User already has a role but is on /onboarding — redirect to home
  if (existingUser && isOnboardingRoute(request)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const headers = new Headers(request.headers)
  headers.set('x-user-id', userId)

  return NextResponse.next({ request: { headers } })
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
}
