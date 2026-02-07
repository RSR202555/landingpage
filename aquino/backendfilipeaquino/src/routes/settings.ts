import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const settingsRouter = Router();

// GET /api/admin/settings
settingsRouter.get('/', async (_req, res) => {
  try {
    let setting = await prisma.setting.findFirst();

    if (!setting) {
      setting = await prisma.setting.create({
        data: {},
      });
    }

    res.json(setting);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

// POST /api/admin/settings
settingsRouter.post('/', async (req, res) => {
  try {
    const {
      siteTitle,
      contactEmail,
      contactPhone,
      cancellationPolicy,
      heroTitle,
      heroSubtitle,
      aboutMe,
      workshopsIntroText,
      workshopsEmptyText,
      avatarUrl,
    } =
      req.body as {
        siteTitle?: string;
        contactEmail?: string;
        contactPhone?: string;
        cancellationPolicy?: string;
        heroTitle?: string;
        heroSubtitle?: string;
        aboutMe?: string;
        workshopsIntroText?: string;
        workshopsEmptyText?: string;
        avatarUrl?: string;
      };

    const safeAboutMe = aboutMe && aboutMe.length > 190 ? aboutMe.slice(0, 190) : aboutMe;

    let setting = await prisma.setting.findFirst();

    if (!setting) {
      setting = await prisma.setting.create({
        data: {
          siteTitle: siteTitle ?? undefined,
          contactEmail: contactEmail ?? undefined,
          contactPhone: contactPhone ?? undefined,
          cancellationPolicy: cancellationPolicy ?? undefined,
          heroTitle: heroTitle ?? undefined,
          heroSubtitle: heroSubtitle ?? undefined,
          aboutMe: safeAboutMe ?? undefined,
          workshopsIntroText: workshopsIntroText ?? undefined,
          workshopsEmptyText: workshopsEmptyText ?? undefined,
          avatarUrl: avatarUrl ?? undefined,
        },
      });
    } else {
      setting = await prisma.setting.update({
        where: { id: setting.id },
        data: {
          siteTitle,
          contactEmail,
          contactPhone,
          cancellationPolicy,
          heroTitle,
          heroSubtitle,
          aboutMe: safeAboutMe,
          workshopsIntroText,
          workshopsEmptyText,
          avatarUrl,
        },
      });
    }

    res.json(setting);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao salvar configurações' });
  }
});
