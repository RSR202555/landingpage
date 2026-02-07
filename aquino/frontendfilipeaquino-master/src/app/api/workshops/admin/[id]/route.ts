import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function PUT(
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

    const { title, description, date, durationMin, maxSeats, price, imageUrl, active } = await request.json();

    const existing = await prisma.workshop.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Workshop não encontrado' }, { status: 404 });
    }

    if (date) {
      const workshopDate = new Date(date);
      const now = new Date();
      if (workshopDate < now) {
        return NextResponse.json({ error: 'A data do workshop não pode ser no passado' }, { status: 400 });
      }
    }

    if (maxSeats !== undefined && maxSeats <= 0) {
      return NextResponse.json({ error: 'Número de vagas deve ser maior que 0' }, { status: 400 });
    }

    if (price !== undefined && price < 0) {
      return NextResponse.json({ error: 'Preço não pode ser negativo' }, { status: 400 });
    }

    const workshop = await prisma.workshop.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        description: description !== undefined ? description : existing.description,
        date: date ? new Date(date) : existing.date,
        durationMin: durationMin !== undefined ? durationMin : existing.durationMin,
        maxSeats: maxSeats !== undefined ? maxSeats : existing.maxSeats,
        price: price !== undefined ? price : existing.price,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
        active: active !== undefined ? active : existing.active,
      },
    });

    return NextResponse.json(workshop);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao atualizar workshop' }, { status: 500 });
  }
}

export async function DELETE(
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

    const existing = await prisma.workshop.findUnique({
      where: { id },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Workshop não encontrado' }, { status: 404 });
    }

    if (existing.bookings.length > 0) {
      return NextResponse.json(
        {
          error: `Não é possível deletar este workshop pois existem ${existing.bookings.length} agendamento(s) confirmado(s)`,
        },
        { status: 400 }
      );
    }

    await prisma.workshop.delete({ where: { id } });

    return NextResponse.json({ message: 'Workshop deletado com sucesso' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao deletar workshop' }, { status: 500 });
  }
}
