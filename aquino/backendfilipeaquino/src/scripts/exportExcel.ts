import { prisma } from '../lib/prisma';
import ExcelJS from 'exceljs';

async function main() {
  const bookings = await prisma.booking.findMany({
    include: {
      service: true,
      workshop: true,
    },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Inscritos');

  sheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Nome', key: 'nome', width: 30 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Telefone', key: 'telefone', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Serviço', key: 'servico', width: 25 },
    { header: 'Workshop', key: 'workshop', width: 25 },
    { header: 'Data', key: 'data', width: 25 },
  ];

  bookings.forEach((b) => {
    sheet.addRow({
      id: b.id,
      nome: b.userName,
      email: b.userEmail,
      telefone: b.userPhone,
      status: b.status,
      servico: b.service?.name ?? '',
      workshop: b.workshop?.title ?? '',
      data: b.scheduledAt.toISOString(),
    });
  });

  const filePath = 'inscritos.xlsx';
  await workbook.xlsx.writeFile(filePath);
  // eslint-disable-next-line no-console
  console.log(`Arquivo gerado: ${filePath}`);
}

main().finally(async () => {
  await prisma.$disconnect();
});
