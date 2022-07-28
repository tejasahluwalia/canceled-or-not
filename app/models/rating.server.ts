import type { Rating } from "@prisma/client";
import { prisma } from "~/db.server";

export type { Rating } from "@prisma/client";

export async function createEmptyRating({
  entityId,
}: Pick<Rating, "entityId">) {
  await prisma.rating.create({
    data: {
      entityId,
      distribution: JSON.stringify({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
        10: 0,
      }),
    },
  });
  return;
}

export async function updateRatingDistribution({
  entityId,
  distribution,
}: Pick<Rating, "entityId" | "distribution">) {
  await prisma.rating.update({
    where: {
      entityId,
    },
    data: {
      distribution,
    },
  });
  return;
}

export async function getRatingDistribution({
  entityId,
}: Pick<Rating, "entityId">) {
  const rating = await prisma.rating.findFirst({
    select: {
      distribution: true,
    },
    where: {
      entityId,
    },
  });
  if (rating) {
    return JSON.parse(rating.distribution) as { [key: number]: number };
  } else {
    return null;
  }
}
