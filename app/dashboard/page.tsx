import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { charityNameFromPreference } from '@/lib/charity-display';

export default async function DashboardHome() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user ?? null;
  if (!user) redirect('/auth/login');

  const [subRes, charityRes, participationsRes] = await Promise.all([
    supabase.from('subscriptions').select('status, current_period_end').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('user_charity_preferences')
      .select('contribution_percent, charities(name)')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase.from('draw_participations').select('draw_id').eq('user_id', user.id),
  ]);

  const drawsEntered = participationsRes.error ? 0 : (participationsRes.data?.length ?? 0);
  const charityName = charityNameFromPreference(charityRes?.data ?? null);
  const contributionPercent =
    typeof charityRes?.data?.contribution_percent === 'number' ? charityRes.data.contribution_percent : 10;
  const subscriptionLabel =
    typeof subRes?.data?.status === 'string' && subRes.data.status.length > 0
      ? subRes.data.status
      : 'inactive';
  const nextDraw = new Date();
  nextDraw.setDate(1);
  nextDraw.setMonth(nextDraw.getMonth() + 1);

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome Back</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Draws Entered</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{drawsEntered}</p>
        </div>
        <div className="bg-charity-light p-6 rounded-xl border border-green-200 shadow-sm">
          <h3 className="text-green-800 text-sm font-medium">Next Draw Date</h3>
          <p className="text-3xl font-bold text-green-900 mt-2">
            {nextDraw.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Subscription</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2 capitalize">
            {subscriptionLabel}
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Your Impact</h2>
        <p className="text-gray-600 mb-4">
          Your subscription contributes <strong>{contributionPercent}%</strong> to{' '}
          <strong>{charityName}</strong>. Your support helps make a real difference.
        </p>
        <div className="flex gap-4">
          <Link
            href="/auth/subscribe"
            className="px-4 py-2 bg-charity text-white rounded-lg hover:bg-charity-dark transition font-medium"
          >
            Manage Subscription
          </Link>
          <Link
            href="/dashboard/profile"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Update Charity
          </Link>
        </div>
      </div>
    </div>
  );
}
