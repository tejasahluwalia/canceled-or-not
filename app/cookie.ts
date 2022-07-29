import { createCookie } from "@remix-run/node";

export const userCookie = createCookie("user", {
  maxAge: 60 * 60 * 24 * 365,
  secure: true,
  httpOnly: true,
  path: "/",
  domain: "canceled-or-not.com",
  sameSite: "strict",
  secrets: ["wPEDg2vY8hDxNFdCKvC7"],
});
