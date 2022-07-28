import type { Entity } from "@prisma/client";
import { prisma } from "~/db.server";
import { slugify } from "~/utils";
import { createEmptyRating } from "./rating.server";

export type { Entity } from "@prisma/client";

export async function getEntity({ slug }: Pick<Entity, "slug">) {
  return await prisma.entity.findFirst({
    select: {
      id: true,
      name: true,
      rating: true,
      imageUrl: true,
      wikipediaId: true,
      incidents: true,
    },
    where: { slug },
  });
}

export function getEntitySuggestions({ name }: Pick<Entity, "name">) {
  // get entities with names that match the name
  return prisma.entity.findMany({
    select: {
      id: true,
      imageUrl: true,
      name: true,
      slug: true,
    },
    where: {
      name: {
        contains: name,
      },
    },
  });
}

export async function createEntity({
  wikipediaId,
  imageUrl,
  name,
}: Pick<Entity, "wikipediaId" | "imageUrl" | "name">) {
  const slug = slugify(name);
  await prisma.entity
    .create({
      data: {
        wikipediaId,
        imageUrl,
        name,
        slug,
      },
    })
    .then(async (entity) => {
      await createEmptyRating({ entityId: entity.id });
    });
  return;
}
