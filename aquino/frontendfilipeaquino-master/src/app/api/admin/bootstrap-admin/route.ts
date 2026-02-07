import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../../lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'email e password são obrigatórios' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: name || 'Admin',
        password: passwordHash,
        role: 'ADMIN' as any,
      },
      create: {
        email,
        name: name || 'Admin',
        password: passwordHash,
        role: 'ADMIN' as any,
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao criar/atualizar admin' }, { status: 500 });
  }
}
