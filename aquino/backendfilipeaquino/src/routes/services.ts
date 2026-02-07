import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const servicesRouter = Router();

// GET /api/services
servicesRouter.get('/', async (_req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { id: 'asc' },
    });

    res.json(services);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao listar serviços' });
  }
});

// GET /api/services/admin - lista todos os serviços (ativos e inativos)
servicesRouter.get('/admin', async (_req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { id: 'asc' },
    });

    res.json(services);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao listar serviços (admin)' });
  }
});

// POST /api/services/admin/create - cria novo serviço
servicesRouter.post('/admin/create', async (req, res) => {
  try {
    const { name, description, durationMin, basePrice, type, active } = req.body as {
      name: string;
      description?: string | null;
      durationMin: number;
      basePrice: number;
      type: string;
      active?: boolean;
    };

    const service = await prisma.service.create({
      data: {
        name,
        description: description ?? null,
        durationMin,
        basePrice,
        type: type as any,
        active: active ?? true,
      },
    });

    res.status(201).json(service);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
});

// POST /api/services/admin/update - atualiza serviço existente
servicesRouter.post('/admin/update', async (req, res) => {
  try {
    const { id, name, description, durationMin, basePrice, type, active } = req.body as {
      id: number;
      name: string;
      description?: string | null;
      durationMin: number;
      basePrice: number;
      type: string;
      active?: boolean;
    };

    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        description: description ?? null,
        durationMin,
        basePrice,
        type: type as any,
        active: active ?? true,
      },
    });

    res.json(service);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao atualizar serviço' });
  }
});

// POST /api/services/admin/delete - exclui serviço
servicesRouter.post('/admin/delete', async (req, res) => {
  try {
    const { id } = req.body as { id: number };

    await prisma.service.delete({ where: { id } });

    res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao excluir serviço' });
  }
});
