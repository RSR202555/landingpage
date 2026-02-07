import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, instagram, notes, planId } = await request.json();

    if (!name || !email || !phone || !planId) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        instagram: instagram || null,
        notes: notes || null,
        planId,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (e) {
    console.error('Erro ao criar lead', e);
    return NextResponse.json({ error: 'Erro ao criar lead' }, { status: 500 });
  }
}
