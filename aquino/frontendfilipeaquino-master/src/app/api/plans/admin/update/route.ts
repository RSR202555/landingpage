import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { id, slug, name, description, price, features, active } = await request.json();

    const plan = await prisma.plan.update({
      where: { id },
      data: {
        slug,
        name,
        description: description ?? null,
        price,
        features: features ?? null,
        active: active ?? true,
      },
    });

    return NextResponse.json(plan);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao atualizar plano' }, { status: 500 });
  }
}
