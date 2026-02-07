// @ts-nocheck
import { MercadoPagoConfig, Preference } from 'mercadopago';

if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
  console.warn('MERCADO_PAGO_ACCESS_TOKEN not set');
}

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
});

const mpPreference = new Preference(mpClient);

export async function createPaymentPreference(
  data: any
): Promise<any> {
  // SDK v2: create({ body })
  const preference = await mpPreference.create({ body: data });

  // Mantém compatibilidade com o código existente que usa preference.body.*
  return {
    body: {
      init_point: preference?.init_point,
      sandbox_init_point: preference?.sandbox_init_point,
      id: preference?.id,
    },
  };
}
