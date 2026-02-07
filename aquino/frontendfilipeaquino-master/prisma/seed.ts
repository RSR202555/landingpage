import { PrismaClient, Role, ServiceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPasswordHash = '$2a$10$5Hq2YhO6yGNqWZTnYI7Ome9H5uKQ9rTnW1xYVZC2o8M7.2rT6B9bK'; // senha: admin123

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin',
      password: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteTitle: 'Agenda Filipe Aquino',
      heroTitle: 'Agende sua aula prática',
      heroSubtitle: 'Escolha o melhor horário para você',
      cancellationPolicy: 'Cancelamentos com até 24h de antecedência.',
    },
  });

  // Serviços padrão
  await prisma.service.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 1,
        name: 'Aula prática individual',
        description: 'Aula prática individual de 1h20',
        durationMin: 80,
        type: ServiceType.AULA_INDIVIDUAL,
        basePrice: 150,
      },
      {
        id: 2,
        name: 'Aula prática em dupla',
        description: 'Aula prática em dupla de 1h20',
        durationMin: 80,
        type: ServiceType.AULA_DUPLA,
        basePrice: 220,
      },
      {
        id: 3,
        name: 'Avaliação física',
        description: 'Avaliação física completa',
        durationMin: 60,
        type: ServiceType.AVALIACAO_FISICA,
        basePrice: 200,
      },
      {
        id: 4,
        name: 'Consulta técnica',
        description: 'Consulta técnica especializada',
        durationMin: 60,
        type: ServiceType.CONSULTA_TECNICA,
        basePrice: 250,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
