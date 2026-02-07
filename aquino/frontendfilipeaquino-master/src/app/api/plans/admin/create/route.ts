import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { slug, name, description, price, features, active } = await request.json();

    const plan = await prisma.plan.create({
      data: {
        slug,
        name,
        description: description ?? null,
        price,
        features: features ?? null,
        active: active ?? true,
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (e: any) {
    console.error(e);
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Slug já está em uso. Escolha outro identificador.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erro ao criar plano' }, { status: 500 });
  }
}
