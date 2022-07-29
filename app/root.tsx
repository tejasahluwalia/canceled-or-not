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
import { SSRProvider } from "react-aria";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import globalStyleSheet from "./styles/global.css";
import { userCookie } from "./cookie";
import { createUser, getUser } from "./models/user.server";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: globalStyleSheet },
    { rel: "stylesheet", href: tailwindStylesheetUrl },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Canceled or Not",
  viewport: "width=device-width,initial-scale=1",
});

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  let id = await userCookie.parse(cookieHeader);

  if (id) {
    let currUser = await getUser({ id: id.id });

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
  } else {
    let newUser = await createUser();
    return json(newUser, {
      headers: {
        "Set-Cookie": await userCookie.serialize({
          userId: newUser.id,
        }),
      },
    });
  }
};

export default function App() {
  const transition = useTransition();
  return (
    <SSRProvider>
      <html lang="en" className="h-full">
        <head>
          <Meta />
          <Links />
        </head>
        <body className="mt-1/5 relative flex h-full min-h-screen flex-col items-center bg-white">
          <section className="sticky top-0 mx-auto w-full bg-black text-center">
            <Form
              method="get"
              action="/search"
              className="container my-8 mx-auto w-full px-4 lg:max-w-3xl"
            >
              <label htmlFor="query">
                <h1 className="my-4 block text-5xl text-[red] sm:text-6xl md:text-7xl lg:text-8xl">
                  Canceled or Not
                </h1>
              </label>
              <div className="mt-8 flex w-full gap-4">
                <input
                  type="search"
                  name="query"
                  className="w-auto flex-1 rounded-lg bg-white p-2"
                  disabled={transition.state === "submitting"}
                />
                <button
                  type="submit"
                  className="rounded-lg border-2 border-gray-200 bg-gray-100 p-2 text-sm font-bold uppercase text-black lg:text-xl"
                >
                  {transition.state === "submitting"
                    ? "Searching..."
                    : "Search"}
                </button>
              </div>
            </Form>
          </section>
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    </SSRProvider>
  );
}
