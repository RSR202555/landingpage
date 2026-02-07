import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { serviceId, date, startTime, endTime } = await request.json();

    if (!serviceId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'serviceId, date, startTime e endTime são obrigatórios' },
        { status: 400 }
      );
    }

    const dateOnly = new Date(`${date}T00:00:00`);
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);

    if (end <= start) {
      return NextResponse.json(
        { error: 'Hora de término deve ser depois da hora inicial.' },
        { status: 400 }
      );
    }

    const availability = await prisma.availability.create({
      data: {
        serviceId,
        date: dateOnly,
        startTime: start,
        endTime: end,
      },
    });

    return NextResponse.json(availability, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao criar disponibilidade' }, { status: 500 });
  }
}
