import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();

    const bookings = await prisma.booking.findMany({
      where: {
        scheduledAt: {
          gte: now,
        },
      },
      include: {
        service: true,
        workshop: true,
        payment: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
      take: 20,
    });

    const result = bookings.map((b) => ({
      id: b.id,
      userName: b.userName,
      userEmail: b.userEmail,
      userPhone: b.userPhone,
      gender: b.gender,
      customField: b.customField,
      status: b.status,
      scheduledAt: b.scheduledAt,
      serviceName: b.service ? b.service.name : null,
      workshopTitle: b.workshop ? b.workshop.title : null,
      paymentStatus: b.payment ? b.payment.status : null,
      paymentAmount: b.payment ? b.payment.amount : null,
    }));

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao listar agendamentos' }, { status: 500 });
  }
}
