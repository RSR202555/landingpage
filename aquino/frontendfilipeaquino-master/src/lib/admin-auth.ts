import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function requireAdminAuth(request: NextRequest): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  if (session && (session.user as any)?.role === 'ADMIN') {
    return null;
  }

  const apiKey = request.headers.get('x-api-key');
  const masterKey = process.env.ADMIN_API_KEY;
  if (masterKey && apiKey === masterKey) {
    return null;
  }

  return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
}
