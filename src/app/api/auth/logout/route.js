import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {}

  let reqHeaders = null;
  try {
    reqHeaders = await headers();
  } catch {}

  const isAdminLogout =
    body.adminOnly === true ||
    reqHeaders?.get('x-admin-request') === 'true' ||
    reqHeaders?.get('referer')?.includes('/admin');

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

  if (isAdminLogout) {
    response.cookies.delete('vegas_admin_session');
  } else if (body.all === true) {
    response.cookies.delete('vegas_session');
    response.cookies.delete('vegas_admin_session');
  } else {
    response.cookies.delete('vegas_session');
  }

  return response;
}
