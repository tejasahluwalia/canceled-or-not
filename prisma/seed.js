import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
  await Promise.all(
    getEntities().map((entity) => {
      return db.entity.create({ data: entity });
    })
  );
}

seed();

function getEntities() {
  return [];
}
