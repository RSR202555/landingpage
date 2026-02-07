// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { prisma } from '../../../../../lib/prisma';
import { sendMail } from '@/lib/mail';
import { timingSafeEqual } from 'crypto';

export const maxDuration = 30;

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
});

const mpPaymentClient = new Payment(mpClient);

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || request.headers.get('x-webhook-token');
    const secret = process.env.MERCADO_PAGO_WEBHOOK_TOKEN;

    if (!secret || !token || !safeEqual(String(token), String(secret))) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    const paymentId = body.data?.id;

    if (!paymentId) {
      return NextResponse.json({ error: 'ID de pagamento não encontrado' }, { status: 400 });
    }

    const paymentIdNum = Number(paymentId);
    if (!Number.isFinite(paymentIdNum)) {
      return NextResponse.json({ error: 'ID de pagamento inválido' }, { status: 400 });
    }

    const mpPayment = await mpPaymentClient.get({ id: paymentIdNum });
    const status = mpPayment.status;

    const providerId = String(mpPayment.id);

    const metadata: any = mpPayment.metadata || {};
    const leadId = metadata.leadId ?? metadata.lead_id;
    const planId = metadata.planId ?? metadata.plan_id;

    // Fluxo de planos de consultoria da landing page
    if (metadata?.type === 'consulting_plan' && leadId) {
      if (status === 'approved') {
        try {
          const leadIdNum = Number(leadId);
          const lead = await prisma.lead.update({
            where: { id: leadIdNum },
            data: { hasPaid: true },
          });

          await sendMail({
            to: lead.email,
            subject: 'Confirmação do seu plano de consultoria',
            html: `<p>Olá ${lead.name},</p>
<p>Seu pagamento do plano de consultoria <strong>${planId || ''}</strong> foi confirmado com sucesso.</p>
<p>Em breve entrarei em contato para alinharmos os próximos passos.</p>
<p>Abraço,<br/>Filipe Aquino</p>`,
          });
        } catch (e) {
          console.error('Erro ao processar pagamento de plano de consultoria', e);
        }
      }

      return NextResponse.json({ received: true });
    }

    const payment = await prisma.payment.findFirst({
      where: { providerId },
      include: { booking: true },
    });

    if (!payment || !payment.booking) {
      return NextResponse.json({ received: true });
    }

    // Idempotência: se já estiver approved, não faz nada
    if (payment.status === 'APPROVED') {
      return NextResponse.json({ received: true });
    }

    if (status === 'approved') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'APPROVED',
          method: mpPayment.payment_method_id,
          rawPayload: mpPayment as any,
        },
      });

      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: 'CONFIRMED',
        },
      });

      if (payment.booking.availabilityId) {
        await prisma.availability.update({
          where: { id: payment.booking.availabilityId },
          data: { isBlocked: true },
        });
      }

      await sendMail({
        to: payment.booking.userEmail,
        subject: 'Confirmação de agendamento',
        html: `<p>Olá ${payment.booking.userName},</p><p>Seu agendamento foi confirmado com sucesso.</p>`,
      });
    } else if (status === 'rejected') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REJECTED',
          method: mpPayment.payment_method_id,
          rawPayload: mpPayment as any,
        },
      });

      await sendMail({
        to: payment.booking.userEmail,
        subject: 'Pagamento recusado',
        html: `<p>Olá ${payment.booking.userName},</p><p>Seu pagamento foi recusado. Tente novamente.</p>`,
      });
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}
