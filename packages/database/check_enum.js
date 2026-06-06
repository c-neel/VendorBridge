const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRawUnsafe(`SELECT table_name, column_name FROM information_schema.columns WHERE udt_name = 'UserRole'`);
  console.log('Tables using UserRole:', result);
}

main().catch(console.error).finally(() => prisma.$disconnect());
