import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { title, description, date, durationMin, maxSeats, price, imageUrl } = await request.json();

    if (!title || !date || !price) {
      return NextResponse.json({ error: 'Título, data e preço são obrigatórios' }, { status: 400 });
    }

    const workshopDate = new Date(date);
    const now = new Date();

    if (workshopDate < now) {
      return NextResponse.json({ error: 'A data do workshop não pode ser no passado' }, { status: 400 });
    }

    if (maxSeats && maxSeats <= 0) {
      return NextResponse.json({ error: 'Número de vagas deve ser maior que 0' }, { status: 400 });
    }

    if (price < 0) {
      return NextResponse.json({ error: 'Preço não pode ser negativo' }, { status: 400 });
    }

    const workshop = await prisma.workshop.create({
      data: {
        title,
        description: description || null,
        date: workshopDate,
        durationMin: durationMin || 240,
        maxSeats: maxSeats || 10,
        price,
        imageUrl: imageUrl || null,
        active: true,
      },
    });

    return NextResponse.json(workshop, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao criar workshop' }, { status: 500 });
  }
}
