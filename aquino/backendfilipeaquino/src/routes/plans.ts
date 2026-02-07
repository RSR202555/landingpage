import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const plansRouter = Router();

// GET /api/plans - público, apenas planos ativos
plansRouter.get('/', async (_req, res) => {
  try {
    const plans = await prisma.plan.findMany({
      where: { active: true },
      orderBy: { id: 'asc' },
    });

    res.json(plans);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao listar planos' });
  }
});

// GET /api/plans/admin - lista todos os planos (ativos e inativos)
plansRouter.get('/admin', async (_req, res) => {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { id: 'asc' },
    });

    res.json(plans);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao listar planos (admin)' });
  }
});

// POST /api/plans/admin/create - cria novo plano
plansRouter.post('/admin/create', async (req, res) => {
  try {
    const { slug, name, description, price, features, active } = req.body as {
      slug: string;
      name: string;
      description?: string | null;
      price: number;
      features?: string | null;
      active?: boolean;
    };

    const plan = await prisma.plan.create({
      data: {
        slug,
        name,
        description: description ?? null,
        price,
        features: features ?? null,
        active: active ?? true,
      },
    });

    res.status(201).json(plan);
  } catch (e: any) {
    console.error(e);
    if (e.code === 'P2002') {
      return res.status(400).json({ error: 'Slug já está em uso. Escolha outro identificador.' });
    }
    res.status(500).json({ error: 'Erro ao criar plano' });
  }
});

// POST /api/plans/admin/update - atualiza plano existente
plansRouter.post('/admin/update', async (req, res) => {
  try {
    const { id, slug, name, description, price, features, active } = req.body as {
      id: number;
      slug: string;
      name: string;
      description?: string | null;
      price: number;
      features?: string | null;
      active?: boolean;
    };

    const plan = await prisma.plan.update({
      where: { id },
      data: {
        slug,
        name,
        description: description ?? null,
        price,
        features: features ?? null,
        active: active ?? true,
      },
    });

    res.json(plan);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao atualizar plano' });
  }
});

// POST /api/plans/admin/delete - exclui plano
plansRouter.post('/admin/delete', async (req, res) => {
  try {
    const { id } = req.body as { id: number };

    await prisma.plan.delete({ where: { id } });

    res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao excluir plano' });
  }
});
