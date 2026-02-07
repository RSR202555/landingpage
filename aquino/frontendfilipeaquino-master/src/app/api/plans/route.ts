import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { active: true },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(plans);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao listar planos' }, { status: 500 });
  }
}
