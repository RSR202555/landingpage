import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    let setting = await prisma.setting.findFirst();

    if (!setting) {
      setting = await prisma.setting.create({
        data: {},
      });
    }

    return NextResponse.json(setting);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

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
    } = await request.json();

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

    return NextResponse.json(setting);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao salvar configurações' }, { status: 500 });
  }
}
