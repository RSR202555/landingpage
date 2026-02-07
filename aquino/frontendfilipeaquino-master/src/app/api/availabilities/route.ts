import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const date = searchParams.get('date');

    if (!serviceId) {
      return NextResponse.json({ error: 'serviceId é obrigatório' }, { status: 400 });
    }

    const where: any = {
      serviceId: Number(serviceId),
      isBlocked: false,
    };

    if (date) {
      const start = new Date(`${date}T00:00:00`);
      if (Number.isNaN(start.getTime())) {
        return NextResponse.json({ error: 'Data inválida. Use o formato YYYY-MM-DD.' }, { status: 400 });
      }
      const endExclusive = new Date(start);
      endExclusive.setDate(endExclusive.getDate() + 1);
      where.date = {
        gte: start,
        lt: endExclusive,
      };
    }

    const availabilities = await prisma.availability.findMany({
      where,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    return NextResponse.json(availabilities);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao listar disponibilidades' }, { status: 500 });
  }
}
