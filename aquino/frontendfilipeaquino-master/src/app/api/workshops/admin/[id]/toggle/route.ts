import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../../lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

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
