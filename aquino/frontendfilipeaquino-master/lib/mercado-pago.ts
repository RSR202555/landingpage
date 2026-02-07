import mercadopago, { PreferenceCreateData, PreferenceResponse } from 'mercadopago';

if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
  console.warn('MERCADO_PAGO_ACCESS_TOKEN not set');
}

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
});

export async function createPaymentPreference(
  data: PreferenceCreateData
): Promise<PreferenceResponse> {
  const preference = await mercadopago.preferences.create(data);
  return preference;
}
