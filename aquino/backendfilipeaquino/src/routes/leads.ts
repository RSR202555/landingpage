import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const leadsRouter = Router();

// POST /api/leads
leadsRouter.post('/', async (req, res) => {
  try {
    const { name, email, phone, instagram, notes, planId } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      instagram?: string;
      notes?: string;
      planId?: string;
    };

    if (!name || !email || !phone || !planId) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        instagram: instagram || null,
        notes: notes || null,
        planId,
      },
    });

    return res.status(201).json(lead);
  } catch (error) {
    console.error('Erro ao criar lead', error);
    return res.status(500).json({ error: 'Erro ao criar lead' });
  }
});

// GET /api/leads/admin
leadsRouter.get('/admin', async (_req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.json(leads);
  } catch (error) {
    console.error('Erro ao listar leads', error);
    return res.status(500).json({ error: 'Erro ao listar leads' });
  }
});
