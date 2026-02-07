import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const workshopsRouter = Router();

// GET /api/workshops - Lista workshops ativos (público)
workshopsRouter.get('/', async (_req, res) => {
  try {
    const workshops = await prisma.workshop.findMany({
      where: { active: true },
      orderBy: { date: 'asc' },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' },
          select: { id: true },
        },
      },
    });

    const withRemaining = workshops.map((w) => ({
      id: w.id,
      title: w.title,
      description: w.description,
      date: w.date,
      durationMin: w.durationMin,
      maxSeats: w.maxSeats,
      price: w.price,
      active: w.active,
      imageUrl: w.imageUrl,
      remainingSeats: w.maxSeats - w.bookings.length,
    }));

    res.json(withRemaining);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao listar workshops' });
  }
});

// GET /api/admin/workshops - Lista todos workshops (admin)
workshopsRouter.get('/admin/all', async (_req, res) => {
  try {
    const workshops = await prisma.workshop.findMany({
      orderBy: { date: 'desc' },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' },
          select: { id: true },
        },
      },
    });

    const withRemaining = workshops.map((w) => ({
      id: w.id,
      title: w.title,
      description: w.description,
      date: w.date,
      durationMin: w.durationMin,
      maxSeats: w.maxSeats,
      price: w.price,
      active: w.active,
      imageUrl: w.imageUrl,
      remainingSeats: w.maxSeats - w.bookings.length,
      confirmedBookings: w.bookings.length,
    }));

    res.json(withRemaining);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao listar workshops' });
  }
});

// POST /api/admin/workshops - Criar novo workshop
workshopsRouter.post('/admin/create', async (req, res) => {
  try {
    const { title, description, date, durationMin, maxSeats, price, imageUrl } = req.body;

    // Validações
    if (!title || !date || !price) {
      return res.status(400).json({ error: 'Título, data e preço são obrigatórios' });
    }

    const workshopDate = new Date(date);
    const now = new Date();

    if (workshopDate < now) {
      return res.status(400).json({ error: 'A data do workshop não pode ser no passado' });
    }

    if (maxSeats && maxSeats <= 0) {
      return res.status(400).json({ error: 'Número de vagas deve ser maior que 0' });
    }

    if (price < 0) {
      return res.status(400).json({ error: 'Preço não pode ser negativo' });
    }

    const workshop = await prisma.workshop.create({
      data: {
        title,
        description: description || null,
        date: workshopDate,
        durationMin: durationMin || 240,
        maxSeats: maxSeats || 10,
        price,
        imageUrl: imageUrl || null,
        active: true,
      },
    });

    res.status(201).json(workshop);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao criar workshop' });
  }
});

// PUT /api/admin/workshops/:id - Atualizar workshop
workshopsRouter.put('/admin/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, date, durationMin, maxSeats, price, imageUrl, active } = req.body;

    const existing = await prisma.workshop.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Workshop não encontrado' });
    }

    // Validações
    if (date) {
      const workshopDate = new Date(date);
      const now = new Date();

      if (workshopDate < now) {
        return res.status(400).json({ error: 'A data do workshop não pode ser no passado' });
      }
    }

    if (maxSeats !== undefined && maxSeats <= 0) {
      return res.status(400).json({ error: 'Número de vagas deve ser maior que 0' });
    }

    if (price !== undefined && price < 0) {
      return res.status(400).json({ error: 'Preço não pode ser negativo' });
    }

    const workshop = await prisma.workshop.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        description: description !== undefined ? description : existing.description,
        date: date ? new Date(date) : existing.date,
        durationMin: durationMin !== undefined ? durationMin : existing.durationMin,
        maxSeats: maxSeats !== undefined ? maxSeats : existing.maxSeats,
        price: price !== undefined ? price : existing.price,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
        active: active !== undefined ? active : existing.active,
      },
    });

    res.json(workshop);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao atualizar workshop' });
  }
});

// DELETE /api/admin/workshops/:id - Deletar workshop
workshopsRouter.delete('/admin/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.workshop.findUnique({
      where: { id },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Workshop não encontrado' });
    }

    // Não permitir deletar workshops com agendamentos confirmados
    if (existing.bookings.length > 0) {
      return res.status(400).json({
        error: `Não é possível deletar este workshop pois existem ${existing.bookings.length} agendamento(s) confirmado(s)`
      });
    }

    await prisma.workshop.delete({ where: { id } });

    res.json({ message: 'Workshop deletado com sucesso' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao deletar workshop' });
  }
});

// PATCH /api/admin/workshops/:id/toggle - Ativar/desativar workshop
workshopsRouter.patch('/admin/:id/toggle', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.workshop.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Workshop não encontrado' });
    }

    const workshop = await prisma.workshop.update({
      where: { id },
      data: { active: !existing.active },
    });

    res.json(workshop);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao alterar status do workshop' });
  }
});

// GET /api/workshops/admin/:id/registrations - Obter inscritos do workshop
workshopsRouter.get('/admin/:id/registrations', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            payment: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!workshop) {
      return res.status(404).json({ error: 'Workshop não encontrado' });
    }

    // Calcular estatísticas
    const totalRegistrations = workshop.bookings.length;
    const confirmedBookings = workshop.bookings.filter(b => b.status === 'CONFIRMED').length;
    const pendingBookings = workshop.bookings.filter(b => b.status === 'PENDING').length;
    const cancelledBookings = workshop.bookings.filter(b => b.status === 'CANCELLED').length;

    const totalRevenue = workshop.bookings
      .filter(b => b.payment?.status === 'APPROVED')
      .reduce((sum, b) => sum + Number(b.payment?.amount || 0), 0);

    // Formatar dados dos inscritos
    const registrations = workshop.bookings.map(booking => ({
      id: booking.id,
      userName: booking.userName,
      userEmail: booking.userEmail,
      userPhone: booking.userPhone,
      gender: booking.gender,
      notes: booking.notes,
      customField: booking.customField,
      status: booking.status,
      registeredAt: booking.createdAt,
      scheduledAt: booking.scheduledAt,
      payment: booking.payment ? {
        status: booking.payment.status,
        amount: booking.payment.amount,
        method: booking.payment.method,
        provider: booking.payment.provider,
      } : null,
    }));

    res.json({
      workshop: {
        id: workshop.id,
        title: workshop.title,
        description: workshop.description,
        date: workshop.date,
        durationMin: workshop.durationMin,
        maxSeats: workshop.maxSeats,
        price: workshop.price,
        active: workshop.active,
        imageUrl: workshop.imageUrl,
      },
      statistics: {
        totalRegistrations,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        totalRevenue,
        remainingSeats: workshop.maxSeats - confirmedBookings,
      },
      registrations,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao buscar inscritos do workshop' });
  }
});
