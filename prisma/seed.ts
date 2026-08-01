import "dotenv/config";
import prisma from "../src/lib/db";

async function main() {
  await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: { name: "Demo User" },
    create: {
      name: "Demo User",
      email: "demo@example.com",
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma["$disconnect"]();
  });
