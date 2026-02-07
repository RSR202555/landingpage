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
  const preference = await mpPreference.create({ body: data });

  return {
    body: {
      init_point: preference?.init_point,
      sandbox_init_point: preference?.sandbox_init_point,
      id: preference?.id,
    },
  };
}
