import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../../../lib/prisma';

export async function GET() {
  // Bloqueado em producao
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Rota desabilitada em produção' }, { status: 403 });
  }

  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const plainPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;

  if (!email || !plainPassword) {
    return NextResponse.json(
      { error: 'ADMIN_BOOTSTRAP_EMAIL e ADMIN_BOOTSTRAP_PASSWORD devem estar configurados nas variáveis de ambiente' },
      { status: 500 }
    );
  }

  try {
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: 'Admin',
        password: passwordHash,
        role: 'ADMIN' as any,
      },
      create: {
        email,
        name: 'Admin',
        password: passwordHash,
        role: 'ADMIN' as any,
      },
    });

    return NextResponse.json({
      message: 'Admin criado/atualizado com sucesso',
      email: user.email,
    });
  } catch (e) {
    console.error('Erro ao criar admin:', e);
    return NextResponse.json({ error: 'Erro ao criar/atualizar admin' }, { status: 500 });
  }
}
