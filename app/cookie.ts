import { createCookie } from "@remix-run/node";

export const userCookie = createCookie("user", {
  maxAge: 60 * 60 * 24 * 365,
  secure: true,
  httpOnly: true,
  path: "/",
  secrets: ["wPEDg2vY8hDxNFdCKvC7"],
});
