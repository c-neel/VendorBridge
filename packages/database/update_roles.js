const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$executeRawUnsafe(`UPDATE users SET role = 'SENIOR_MANAGER' WHERE role = 'DIRECTOR'`);
  console.log('Updated users:', result);
}

main().catch(console.error).finally(() => prisma.$disconnect());
