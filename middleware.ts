import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const isValidSupabaseUrl = (url: string | undefined) =>
  url && (url.startsWith('https://') || url.startsWith('http://')) && !url.includes('placeholder');

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!isValidSupabaseUrl(supabaseUrl) || !supabaseKey || supabaseKey.includes('placeholder')) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
  const isSubscribePage = request.nextUrl.pathname === '/auth/subscribe';

  // Logged-in users: send admins → /admin, others → /dashboard (no manual /admin URL)
  if (isAuthRoute && !isSubscribePage && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    const dest = profile?.role === 'admin' ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Subscribe page requires login
  if (isSubscribePage && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Dashboard requires authentication
  if (isDashboardRoute && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Admin requires auth + admin role (checked in layout, middleware just checks auth)
  if (isAdminRoute && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/:path*'],
};
