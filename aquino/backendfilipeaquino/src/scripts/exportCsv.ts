import { prisma } from '../lib/prisma';
import Papa from 'papaparse';

async function main() {
  const bookings = await prisma.booking.findMany({
    include: {
      service: true,
      workshop: true,
    },
  });

  const rows = bookings.map((b) => ({
    id: b.id,
    nome: b.userName,
    email: b.userEmail,
    telefone: b.userPhone,
    status: b.status,
    servico: b.service?.name ?? '',
    workshop: b.workshop?.title ?? '',
    data: b.scheduledAt.toISOString(),
  }));

  const csv = Papa.unparse(rows, { delimiter: ';' });
  // eslint-disable-next-line no-console
  console.log(csv);
}

main().finally(async () => {
  await prisma.$disconnect();
});
