import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Setting unlimited credits for antoni.ziolek2@gmail.com...");
  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: "antoni.ziolek2@gmail.com",
        mode: "insensitive"
      }
    }
  });

  if (user) {
    console.log(`Found user: ${user.id} with email ${user.email}. Setting credits to 999999.`);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: 999999,
        dailyFreeScans: 0
      }
    });
    console.log("User successfully updated!");
  } else {
    console.log("User antoni.ziolek2@gmail.com was not found in the database yet. Their account will be automatically created with unlimited credits when they next log in.");
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
