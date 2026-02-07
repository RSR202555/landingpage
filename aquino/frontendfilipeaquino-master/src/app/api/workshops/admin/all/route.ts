import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const workshops = await prisma.workshop.findMany({
      orderBy: { date: 'desc' },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' },
          select: { id: true },
        },
      },
    });

    const withRemaining = workshops.map((w) => ({
      id: w.id,
      title: w.title,
      description: w.description,
      date: w.date,
      durationMin: w.durationMin,
      maxSeats: w.maxSeats,
      price: w.price,
      active: w.active,
      imageUrl: w.imageUrl,
      remainingSeats: w.maxSeats - w.bookings.length,
      confirmedBookings: w.bookings.length,
    }));

    return NextResponse.json(withRemaining);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao listar workshops' }, { status: 500 });
  }
}
