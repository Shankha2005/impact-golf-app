/**
 * After login/signup, send admins to /admin and everyone else to /dashboard.
 */
export async function getPostAuthRedirectPath(): Promise<string> {
  try {
    const r = await fetch('/api/me', { credentials: 'include' });
    if (!r.ok) return '/dashboard';
    const data = await r.json();
    return data.profile?.role === 'admin' ? '/admin' : '/dashboard';
  } catch {
    return '/dashboard';
  }
}
