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
