"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');
    // Criar serviços padrão
    const services = [
        {
            name: 'Aula prática individual',
            description: 'Aula prática individual de 1h20',
            durationMin: 80,
            basePrice: 1.00,
            type: client_1.ServiceType.AULA_INDIVIDUAL,
            active: true,
        },
        {
            name: 'Aula prática em dupla',
            description: 'Aula prática em dupla de 1h20',
            durationMin: 80,
            basePrice: 1.00,
            type: client_1.ServiceType.AULA_DUPLA,
            active: true,
        },
        {
            name: 'Avaliação física',
            description: 'Avaliação física completa',
            durationMin: 60,
            basePrice: 1.00,
            type: client_1.ServiceType.AVALIACAO_FISICA,
            active: true,
        },
        {
            name: 'Consulta técnica',
            description: 'Consulta técnica especializada',
            durationMin: 60,
            basePrice: 1.00,
            type: client_1.ServiceType.CONSULTA_TECNICA,
            active: true,
        },
    ];
    for (const service of services) {
        const existing = await prisma.service.findFirst({
            where: { name: service.name },
        });
        if (!existing) {
            await prisma.service.create({
                data: service,
            });
            console.log(`✅ Serviço criado: ${service.name}`);
        }
        else {
            console.log(`⏭️  Serviço já existe: ${service.name}`);
        }
    }
    console.log('✅ Seed concluído!');
}
main()
    .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
