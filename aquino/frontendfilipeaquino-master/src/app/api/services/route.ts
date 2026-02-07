import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(services);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao listar serviços' }, { status: 500 });
  }
}
