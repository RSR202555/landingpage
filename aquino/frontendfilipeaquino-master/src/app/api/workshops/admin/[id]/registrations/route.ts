import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../../lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(
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

    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: {
        bookings: {
          include: { payment: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!workshop) {
      return NextResponse.json({ error: 'Workshop não encontrado' }, { status: 404 });
    }

    const totalRegistrations = workshop.bookings.length;
    const confirmedBookings = workshop.bookings.filter((b) => b.status === 'CONFIRMED').length;
    const pendingBookings = workshop.bookings.filter((b) => b.status === 'PENDING').length;
    const cancelledBookings = workshop.bookings.filter((b) => b.status === 'CANCELLED').length;

    const totalRevenue = workshop.bookings
      .filter((b) => b.payment?.status === 'APPROVED')
      .reduce((sum, b) => sum + Number(b.payment?.amount || 0), 0);

    const registrations = workshop.bookings.map((booking) => ({
      id: booking.id,
      userName: booking.userName,
      userEmail: booking.userEmail,
      userPhone: booking.userPhone,
      gender: booking.gender,
      notes: booking.notes,
      customField: booking.customField,
      status: booking.status,
      registeredAt: booking.createdAt,
      scheduledAt: booking.scheduledAt,
      payment: booking.payment
        ? {
            status: booking.payment.status,
            amount: booking.payment.amount,
            method: booking.payment.method,
            provider: booking.payment.provider,
          }
        : null,
    }));

    return NextResponse.json({
      workshop: {
        id: workshop.id,
        title: workshop.title,
        description: workshop.description,
        date: workshop.date,
        durationMin: workshop.durationMin,
        maxSeats: workshop.maxSeats,
        price: workshop.price,
        active: workshop.active,
        imageUrl: workshop.imageUrl,
      },
      statistics: {
        totalRegistrations,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        totalRevenue,
        remainingSeats: workshop.maxSeats - confirmedBookings,
      },
      registrations,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao buscar inscritos do workshop' }, { status: 500 });
  }
}
