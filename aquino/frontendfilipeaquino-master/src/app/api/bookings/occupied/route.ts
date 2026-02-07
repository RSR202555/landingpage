import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const serviceId = searchParams.get('serviceId');
    const workshopId = searchParams.get('workshopId');

    if (!date) {
      return NextResponse.json({ error: 'Parâmetro date é obrigatório (YYYY-MM-DD)' }, { status: 400 });
    }

    if (!serviceId && !workshopId) {
      return NextResponse.json({ error: 'serviceId ou workshopId é obrigatório' }, { status: 400 });
    }

    const start = new Date(`${date}T00:00:00`);
    const endExclusive = new Date(start);
    endExclusive.setDate(endExclusive.getDate() + 1);

    const bookings = await prisma.booking.findMany({
      where: {
        scheduledAt: {
          gte: start,
          lt: endExclusive,
        },
        serviceId: serviceId ? Number(serviceId) : undefined,
        workshopId: workshopId ? Number(workshopId) : undefined,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: {
        scheduledAt: true,
      },
    });

    const occupiedTimes = bookings.map((b) => b.scheduledAt.toTimeString().slice(0, 5));

    return NextResponse.json({ occupiedTimes });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao buscar horários ocupados' }, { status: 500 });
  }
}
