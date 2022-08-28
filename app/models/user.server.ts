import type { User } from "@prisma/client";
import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function createUser() {
  // Create a new user
  const user = await prisma.user.create({
    data: {},
  });

  return user;
}

export async function getUser({ id }: Pick<User, "id">) {
  // Get a user by their ID
  const user = await prisma.user.findFirst({
    where: { id },
  });

  return user;
}
