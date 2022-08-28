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
      descriptionUrl: true,
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
      descriptionUrl: true,
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
  name,
  pageImage,
}: Pick<Entity, "wikipediaId" | "name"> & { pageImage?: string }) {
  const slug = slugify(name);
  if (pageImage) {
    let data = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=File%3A${pageImage}&utf8=1&formatversion=latest&pithumbsize=500`
    ).then((res) => res.json());
    let imageUrl = data.query.pages[0].thumbnail.source;
    data = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&titles=File%3A${pageImage}&utf8=1&formatversion=latest&iiprop=url`
    ).then((res) => res.json());
    let descriptionUrl = data.query.pages[0].imageinfo[0].descriptionurl;

    await prisma.entity
      .create({
        data: {
          wikipediaId,
          imageUrl,
          descriptionUrl,
          name,
          slug,
        },
      })
      .then(async (entity) => {
        await createEmptyRating({ entityId: entity.id });
      });
  } else {
    await prisma.entity
      .create({
        data: {
          wikipediaId,
          imageUrl: "/default-image.png",
          name,
          slug,
        },
      })
      .then(async (entity) => {
        await createEmptyRating({ entityId: entity.id });
      });
  }

  return;
}

export async function getPopularEntities() {
  return await prisma.entity.findMany({
    orderBy: {
      votes: {
        _count: "desc",
      },
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      slug: true,
      _count: {
        select: {
          votes: true,
        },
      },
    },
    take: 5,
  });
}
