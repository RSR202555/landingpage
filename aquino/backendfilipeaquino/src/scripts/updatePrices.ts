import { prisma } from "../lib/prisma";

async function main() {
  const result = await prisma.service.updateMany({
    data: {
      basePrice: 1,
    },
  });

  // eslint-disable-next-line no-console
  console.log(`Atualizados ${result.count} serviços para basePrice = 1`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
