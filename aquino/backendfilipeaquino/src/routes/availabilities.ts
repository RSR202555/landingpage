import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const availabilitiesRouter = Router();

function getDayRange(date: string) {
  const start = new Date(`${date}T00:00:00`);
  if (Number.isNaN(start.getTime())) {
    throw new Error('Data inválida. Use o formato YYYY-MM-DD.');
  }
  const endExclusive = new Date(start);
  endExclusive.setDate(endExclusive.getDate() + 1);
  return { start, endExclusive };
}

// GET /api/availabilities?serviceId=1&date=YYYY-MM-DD
availabilitiesRouter.get('/', async (req, res) => {
  try {
    const { serviceId, date } = req.query as {
      serviceId?: string;
      date?: string;
    };

    if (!serviceId) {
      return res.status(400).json({ error: 'serviceId é obrigatório' });
    }

    const where: any = {
      serviceId: Number(serviceId),
      isBlocked: false,
    };

    if (date) {
      const { start, endExclusive } = getDayRange(date);
      where.date = {
        gte: start,
        lt: endExclusive,
      };
    }

    const availabilities = await prisma.availability.findMany({
      where,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    res.json(availabilities);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao listar disponibilidades' });
  }
});

// GET /api/availabilities/admin?serviceId=1
availabilitiesRouter.get('/admin', async (req, res) => {
  try {
    const { serviceId } = req.query as { serviceId?: string };

    if (!serviceId) {
      return res.status(400).json({ error: 'serviceId é obrigatório' });
    }

    const availabilities = await prisma.availability.findMany({
      where: { serviceId: Number(serviceId) },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    res.json(availabilities);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao listar disponibilidades' });
  }
});

// POST /api/availabilities/admin/create
availabilitiesRouter.post('/admin/create', async (req, res) => {
  try {
    const { serviceId, date, startTime, endTime } = req.body as {
      serviceId: number;
      date: string; // YYYY-MM-DD
      startTime: string; // HH:MM
      endTime: string; // HH:MM
    };

    if (!serviceId || !date || !startTime || !endTime) {
      return res
        .status(400)
        .json({ error: 'serviceId, date, startTime e endTime são obrigatórios' });
    }

    const dateOnly = new Date(`${date}T00:00:00`);
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);

    if (end <= start) {
      return res.status(400).json({ error: 'Hora de término deve ser depois da hora inicial.' });
    }

    const availability = await prisma.availability.create({
      data: {
        serviceId,
        date: dateOnly,
        startTime: start,
        endTime: end,
      },
    });

    res.status(201).json(availability);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao criar disponibilidade' });
  }
});

// POST /api/availabilities/admin/delete
availabilitiesRouter.post('/admin/delete', async (req, res) => {
  try {
    const { id } = req.body as { id: number };

    if (!id) {
      return res.status(400).json({ error: 'id é obrigatório' });
    }

    await prisma.availability.delete({ where: { id } });

    res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao excluir disponibilidade' });
  }
});
