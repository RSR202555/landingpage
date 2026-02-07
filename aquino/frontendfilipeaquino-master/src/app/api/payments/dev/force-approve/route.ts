import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId é obrigatório' }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment || !payment.booking) {
      return NextResponse.json({ error: 'Pagamento ou agendamento não encontrado' }, { status: 404 });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'APPROVED' },
    });

    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'CONFIRMED' },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Erro ao forçar aprovação de pagamento (dev)', e);
    return NextResponse.json({ error: 'Erro ao forçar aprovação de pagamento' }, { status: 500 });
  }
}
