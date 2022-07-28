import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Form,
  useTransition,
} from "@remix-run/react";
import { createCookie } from "@remix-run/node";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import globalStyleSheet from "./styles/global.css";
import { userCookie } from "./cookie";
import { createUser } from "./models/user.server";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    { rel: "stylesheet", href: globalStyleSheet },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Canceled or Not",
  viewport: "width=device-width,initial-scale=1",
});

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  let currUser = await userCookie.parse(cookieHeader);
  if (!currUser) {
    let newUser = await createUser();
    return json(newUser, {
      headers: {
        "Set-Cookie": await userCookie.serialize({ userId: newUser.id }),
      },
    });
  } else {
    return null;
  }
};

export default function App() {
  const transition = useTransition();
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="mt-1/5 container relative mx-auto flex h-full min-h-screen flex-col items-center bg-white px-4">
        <section className="sticky top-0 w-full bg-white text-center">
          <h1 className="text-3xl">Canceled or Not</h1>
          <Form method="get" action="/search">
            <input
              type="search"
              name="query"
              className="border"
              disabled={transition.state === "submitting"}
            />
            <button type="submit" className="border">
              {transition.state === "submitting" ? "Searching..." : "Search"}
            </button>
          </Form>
        </section>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
