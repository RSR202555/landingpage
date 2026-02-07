import { NextRequest, NextResponse } from 'next/server';
import { createPaymentPreference } from '@/lib/mercado-pago';

export async function POST(request: NextRequest) {
  try {
    const { planId, leadId } = await request.json();

    const plans: Record<string, { title: string; price: number; description: string }> = {
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
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    const plan = plans[planId];

    const backendBaseUrl = process.env.BACKEND_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const frontendBaseUrl = process.env.FRONTEND_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

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

    return NextResponse.json({
      init_point: preference.body.init_point,
      sandbox_init_point: preference.body.sandbox_init_point,
    });
  } catch (e) {
    console.error('Erro ao criar preferência de pagamento', e);
    return NextResponse.json({ error: 'Erro ao criar preferência de pagamento' }, { status: 500 });
  }
}
