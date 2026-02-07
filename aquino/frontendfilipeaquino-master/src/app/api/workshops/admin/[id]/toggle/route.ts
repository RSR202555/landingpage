import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../../lib/prisma';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    const existing = await prisma.workshop.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Workshop não encontrado' }, { status: 404 });
    }

    const workshop = await prisma.workshop.update({
      where: { id },
      data: { active: !existing.active },
    });

    return NextResponse.json(workshop);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao alterar status do workshop' }, { status: 500 });
  }
}
