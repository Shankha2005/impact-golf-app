/**
 * user_charity_preferences joined with charities(name) may return `charities` as an object
 * or a one-element array depending on PostgREST shape — normalize to a display name.
 */
export function charityNameFromPreference(pref: unknown): string {
  if (!pref || typeof pref !== 'object') return '—';
  const raw = (pref as { charities?: unknown }).charities;
  if (Array.isArray(raw)) {
    const first = raw[0];
    if (first && typeof first === 'object' && 'name' in first) {
      return String((first as { name: string }).name);
    }
    return '—';
  }
  if (raw && typeof raw === 'object' && 'name' in raw) {
    return String((raw as { name: string }).name);
  }
  return '—';
}
