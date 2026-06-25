const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Load env
const envFile = fs.readFileSync('.env', 'utf8');
const dbUrl = envFile.match(/DATABASE_URL="([^"]+)"/)[1];

const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const logs = await prisma.calorieLog.findMany({
    orderBy: { date: 'asc' }
  });
  console.log("Calorie Logs in DB:");
  console.log(JSON.stringify(logs, null, 2));
}

main().catch(err => console.error(err)).finally(() => prisma.$disconnect());
