import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // Get the redirect_to parameter and decode it if it's URL encoded
  let redirectTo = requestUrl.searchParams.get('redirect_to') || '/';
  try {
    // Sometimes the redirect_to might be URL encoded
    if (redirectTo.startsWith('%2F')) {
      redirectTo = decodeURIComponent(redirectTo);
    }
  } catch (error) {
    console.error('Error decoding redirect URL:', error);
  }

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  
  // Construct the full URL for redirection
  const redirectUrl = new URL(redirectTo, requestUrl.origin);
  console.log('Redirecting to:', redirectUrl.toString());
  
  return NextResponse.redirect(redirectUrl);
}
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}