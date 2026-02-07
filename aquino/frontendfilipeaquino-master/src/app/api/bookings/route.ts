import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { createPaymentPreference } from '@/lib/mercado-pago';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.customer?.name || !body.customer.email || !body.scheduledAt) {
      return NextResponse.json({ error: 'Dados do cliente e horário são obrigatórios' }, { status: 400 });
    }

    if (!body.serviceId && !body.workshopId) {
      return NextResponse.json({ error: 'serviceId ou workshopId é obrigatório' }, { status: 400 });
    }

    let amount = 0;
    let title = 'Agendamento';

    if (body.serviceId) {
      const service = await prisma.service.findUnique({ where: { id: body.serviceId } });
      if (!service) return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 400 });
      amount = Number(service.basePrice);
      title = service.name;
    }

    if (body.workshopId) {
      const workshop = await prisma.workshop.findUnique({ where: { id: body.workshopId } });
      if (!workshop) return NextResponse.json({ error: 'Workshop não encontrado' }, { status: 400 });
      amount = Number(workshop.price);
      title = workshop.title;
    }

    const scheduledDate = new Date(body.scheduledAt);

    const booking = await prisma.booking.create({
      data: {
        userName: body.customer.name,
        userEmail: body.customer.email,
        userPhone: body.customer.phone,
        gender: body.customer.gender,
        notes: body.notes,
        customField: body.customField,
        status: 'PENDING',
        scheduledAt: scheduledDate,
        serviceId: body.serviceId,
        workshopId: body.workshopId,
        availabilityId: body.availabilityId,
      },
    });

    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount,
        status: 'PENDING',
      },
    });

    const backendBaseUrl = process.env.BACKEND_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const frontendBaseUrl = process.env.FRONTEND_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const preference = await createPaymentPreference({
      items: [
        {
          id: String(booking.id),
          title,
          quantity: 1,
          unit_price: amount,
          currency_id: 'BRL',
        },
      ],
      payer: {
        name: body.customer.name,
        email: body.customer.email,
      },
      back_urls: {
        success: `${frontendBaseUrl}/booking/success`,
        failure: `${frontendBaseUrl}/booking/failure`,
        pending: `${frontendBaseUrl}/booking/pending`,
      },
      notification_url: `${backendBaseUrl}/api/payments/webhook?token=${process.env.MERCADO_PAGO_WEBHOOK_TOKEN}`,
      metadata: {
        bookingId: booking.id,
        paymentId: payment.id,
      },
    } as any);

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerId: String(preference.body.id ?? preference.body.init_point ?? ''),
      },
    });

    return NextResponse.json(
      {
        bookingId: booking.id,
        paymentId: payment.id,
        initPoint: (preference.body as any).init_point,
        sandboxInitPoint: (preference.body as any).sandbox_init_point,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 });
  }
}
