import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { createPaymentPreference } from '../lib/mercado-pago';

export const bookingsRouter = Router();

interface CreateBookingBody {
  serviceId?: number;
  workshopId?: number;
  availabilityId?: number;
  scheduledAt: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    gender?: string;
  };
  notes?: string;
  customField?: string;
}

// POST /api/bookings
bookingsRouter.post('/', async (req, res) => {
  try {
    const body = req.body as CreateBookingBody;

    if (!body.customer?.name || !body.customer.email || !body.scheduledAt) {
      return res.status(400).json({ error: 'Dados do cliente e horário são obrigatórios' });
    }

    if (!body.serviceId && !body.workshopId) {
      return res.status(400).json({ error: 'serviceId ou workshopId é obrigatório' });
    }

    let amount = 0;
    let title = 'Agendamento';

    if (body.serviceId) {
      const service = await prisma.service.findUnique({ where: { id: body.serviceId } });
      if (!service) return res.status(400).json({ error: 'Serviço não encontrado' });
      amount = Number(service.basePrice);
      title = service.name;
    }

    if (body.workshopId) {
      const workshop = await prisma.workshop.findUnique({ where: { id: body.workshopId } });
      if (!workshop) return res.status(400).json({ error: 'Workshop não encontrado' });
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

    const backendBaseUrl = process.env.BACKEND_BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
    const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';

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

    res.status(201).json({
      bookingId: booking.id,
      paymentId: payment.id,
      initPoint: (preference.body as any).init_point,
      sandboxInitPoint: (preference.body as any).sandbox_init_point,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

// GET /api/bookings/occupied?date=YYYY-MM-DD&serviceId=1
bookingsRouter.get('/occupied', async (req, res) => {
  try {
    const { date, serviceId, workshopId } = req.query as {
      date?: string;
      serviceId?: string;
      workshopId?: string;
    };

    if (!date) {
      return res.status(400).json({ error: 'Parâmetro date é obrigatório (YYYY-MM-DD)' });
    }

    if (!serviceId && !workshopId) {
      return res.status(400).json({ error: 'serviceId ou workshopId é obrigatório' });
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

    res.json({ occupiedTimes });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao buscar horários ocupados' });
  }
});

// GET /api/bookings/admin/upcoming
bookingsRouter.get('/admin/upcoming', async (_req, res) => {
  try {
    const now = new Date();

    const bookings = await prisma.booking.findMany({
      where: {
        scheduledAt: {
          gte: now,
        },
      },
      include: {
        service: true,
        workshop: true,
        payment: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
      take: 20,
    });

    const result = bookings.map((b) => ({
      id: b.id,
      userName: b.userName,
      userEmail: b.userEmail,
      userPhone: b.userPhone,
      gender: b.gender,
      customField: b.customField,
      status: b.status,
      scheduledAt: b.scheduledAt,
      serviceName: b.service ? b.service.name : null,
      workshopTitle: b.workshop ? b.workshop.title : null,
      paymentStatus: b.payment ? b.payment.status : null,
      paymentAmount: b.payment ? b.payment.amount : null,
    }));

    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao listar agendamentos' });
  }
});
