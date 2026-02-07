import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '../../../../../lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.' }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const base = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_');
    const timestamp = Date.now();
    const filename = `avatars/${base}-${timestamp}.${ext}`;

    const blob = await put(filename, file, {
      access: 'public',
    });

    let setting = await prisma.setting.findFirst();
    if (!setting) {
      setting = await prisma.setting.create({
        data: { avatarUrl: blob.url },
      });
    } else {
      setting = await prisma.setting.update({
        where: { id: setting.id },
        data: { avatarUrl: blob.url },
      });
    }

    return NextResponse.json({ avatarUrl: blob.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao enviar avatar' }, { status: 500 });
  }
}
