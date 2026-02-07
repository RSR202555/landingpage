import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    if (!serviceId) {
      return NextResponse.json({ error: 'serviceId é obrigatório' }, { status: 400 });
    }

    const availabilities = await prisma.availability.findMany({
      where: { serviceId: Number(serviceId) },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    return NextResponse.json(availabilities);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao listar disponibilidades' }, { status: 500 });
  }
}
