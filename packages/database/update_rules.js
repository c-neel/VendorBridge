const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$executeRawUnsafe(`UPDATE approval_rules SET "approverRole" = 'SENIOR_MANAGER' WHERE "approverRole" = 'DIRECTOR'`);
  console.log('Updated approval_rules:', result);
}

main().catch(console.error).finally(() => prisma.$disconnect());
