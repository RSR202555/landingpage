// @ts-nocheck
import { Router } from 'express';
import mercadopago from 'mercadopago';
import { prisma } from '../lib/prisma';
import { sendMail } from '../lib/mail';
import { createPaymentPreference } from '../lib/mercado-pago';
import { timingSafeEqual } from 'crypto';

export const paymentsRouter = Router();

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

interface MercadoPagoWebhookBody {
  action?: string;
  data?: { id?: string };
  type?: string;
}

// POST /api/payments/create-preference
paymentsRouter.post('/create-preference', async (req, res) => {
  try {
    const { planId, leadId } = req.body as { planId?: string; leadId?: number };

    const plans: Record<
      string,
      { title: string; price: number; description: string }
    > = {
      basico: {
        title: 'Plano Básico',
        price: 197,
        description: '2 sessões mensais de consultoria',
      },
      intermediario: {
        title: 'Plano Intermediário',
        price: 297,
        description: '4 sessões mensais de consultoria',
      },
      anual: {
        title: 'Plano Premium',
        price: 497,
        description: '8 sessões mensais com acompanhamento premium',
      },
    };

    if (!planId || !plans[planId]) {
      return res.status(400).json({ error: 'Plano inválido' });
    }

    const plan = plans[planId];

    const backendBaseUrl =
      process.env.BACKEND_BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
    const frontendBaseUrl =
      process.env.FRONTEND_BASE_URL || 'http://localhost:3000';

    const preference = await createPaymentPreference({
      items: [
        {
          title: plan.title,
          description: plan.description,
          quantity: 1,
          unit_price: plan.price,
          currency_id: 'BRL',
        },
      ],
      back_urls: {
        success: frontendBaseUrl,
        failure: frontendBaseUrl,
        pending: frontendBaseUrl,
      },
      notification_url: `${backendBaseUrl}/api/payments/webhook?token=${process.env.MERCADO_PAGO_WEBHOOK_TOKEN}`,
      metadata: {
        type: 'consulting_plan',
        planId,
        leadId,
      },
    });

    return res.json({
      init_point: preference.body.init_point,
      sandbox_init_point: preference.body.sandbox_init_point,
    });
  } catch (error) {
    console.error('Erro ao criar preferência de pagamento', error);
    return res.status(500).json({ error: 'Erro ao criar preferência de pagamento' });
  }
});

// POST /api/payments/dev/force-approve
// Rota de apoio para AMBIENTE DE DESENVOLVIMENTO LOCAL apenas.
// Força a aprovação de um pagamento e confirmação de agendamento sem depender do webhook do Mercado Pago.
paymentsRouter.post('/dev/force-approve', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Rota desabilitada em produção' });
    }

    const { paymentId } = req.body as { paymentId?: number };

    if (!paymentId) {
      return res.status(400).json({ error: 'paymentId é obrigatório' });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment || !payment.booking) {
      return res.status(404).json({ error: 'Pagamento ou agendamento não encontrado' });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'APPROVED' },
    });

    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'CONFIRMED' },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Erro ao forçar aprovação de pagamento (dev)', error);
    return res.status(500).json({ error: 'Erro ao forçar aprovação de pagamento' });
  }
});

// POST /api/payments/webhook
paymentsRouter.post('/webhook', async (req, res) => {
  try {
    const token = String(req.query.token || req.headers['x-webhook-token'] || '');
    const secret = process.env.MERCADO_PAGO_WEBHOOK_TOKEN;
    if (!secret || !token || !safeEqual(token, String(secret))) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const body = req.body as MercadoPagoWebhookBody;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Payload inválido' });
    }

    const paymentId = body.data?.id;

    if (!paymentId) {
      return res.status(400).json({ error: 'ID de pagamento não encontrado' });
    }

    const paymentIdNum = Number(paymentId);
    if (!Number.isFinite(paymentIdNum)) {
      return res.status(400).json({ error: 'ID de pagamento inválido' });
    }

    const mpPayment = await mercadopago.payment.findById(paymentIdNum);
    const status = mpPayment.body.status;

    const providerId = String(mpPayment.body.id);

    const metadata: any = mpPayment.body.metadata || {};
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

      return res.status(200).json({ received: true });
    }

    const payment = await prisma.payment.findFirst({
      where: { providerId },
      include: { booking: true },
    });

    if (!payment || !payment.booking) {
      // não conseguimos associar, mas respondemos 200 para evitar reenvio infinito
      return res.status(200).json({ received: true });
    }

    // Idempotência: se já estiver approved, não faz nada
    if (payment.status === 'APPROVED') {
      return res.status(200).json({ received: true });
    }

    if (status === 'approved') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'APPROVED',
          method: mpPayment.body.payment_method_id,
          rawPayload: mpPayment.body as any,
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
          method: mpPayment.body.payment_method_id,
          rawPayload: mpPayment.body as any,
        },
      });

      await sendMail({
        to: payment.booking.userEmail,
        subject: 'Pagamento recusado',
        html: `<p>Olá ${payment.booking.userName},</p><p>Seu pagamento foi recusado. Tente novamente.</p>`,
      });
    }

    res.status(200).json({ received: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});
