import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const services = await prisma.service.findMany({
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(services);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao listar serviços (admin)' }, { status: 500 });
  }
}
