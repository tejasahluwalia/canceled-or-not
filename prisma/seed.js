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
  return [
    {
      name: "Tom Hanks",
      imageURL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Tom_Hanks_TIFF_2019.jpg/220px-Tom_Hanks_TIFF_2019.jpg",
      wikipediaId: "Tom_Hanks",
    },
  ];
}
