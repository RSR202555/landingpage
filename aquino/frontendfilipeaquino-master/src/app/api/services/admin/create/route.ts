import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { name, description, durationMin, basePrice, type, active } = await request.json();

    const service = await prisma.service.create({
      data: {
        name,
        description: description ?? null,
        durationMin,
        basePrice,
        type: type as any,
        active: active ?? true,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao criar serviço' }, { status: 500 });
  }
}
