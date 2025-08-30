import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/auth(.*)', '/', '/sso-callback']);

export default clerkMiddleware(async (auth, req) => {
  // Log the path being requested
  console.log('Middleware triggered for path:', req.nextUrl.pathname);

  const { userId } = await auth();

  // Log the userId returned by Clerk
  console.log('User ID from auth():', userId);

  if (!userId && !isPublicRoute(req)) {
    const signUpUrl = new URL('/auth/signup', req.url);
    // Log the redirect URL
    console.log('Redirecting to signup page:', signUpUrl.toString());
    return NextResponse.redirect(signUpUrl);
  }

  console.log('Middleware allowing access to path:', req.nextUrl.pathname);
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
