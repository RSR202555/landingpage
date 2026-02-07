import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(leads);
  } catch (e) {
    console.error('Erro ao listar leads', e);
    return NextResponse.json({ error: 'Erro ao listar leads' }, { status: 500 });
  }
}
