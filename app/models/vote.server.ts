import type { Vote } from "@prisma/client";
import { prisma } from "~/db.server";
import {
  createEmptyRating,
  getRatingDistribution,
  updateRatingDistribution,
} from "./rating.server";

export type { Vote } from "@prisma/client";

export async function createVote({
  entityId,
  value,
  userId,
}: Pick<Vote, "entityId" | "value" | "userId">) {
  // Get current rating distribution
  let ratingDistribution = await getRatingDistribution({ entityId });

  // Check if the user has already voted for this entity
  const vote = await prisma.vote.findFirst({
    select: {
      id: true,
      value: true,
    },
    where: {
      userId,
      entityId,
    },
  });

  if (vote) {
    // If the user has already voted for this entity, update the vote
    await prisma.vote.update({
      where: {
        id: vote.id,
      },
      data: {
        value,
      },
    });
    ratingDistribution![vote.value] -= 1;
  } else {
    // If the user has not voted for this entity, create a new vote
    await prisma.vote.create({
      data: {
        entityId,
        value,
        userId,
      },
    });
  }

  ratingDistribution![value] += 1;
  // Update the distribution of votes for this entity
  await updateRatingDistribution({
    entityId,
    distribution: JSON.stringify(ratingDistribution),
  });

  return;
}
