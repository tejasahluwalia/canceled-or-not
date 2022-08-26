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
import { useEffect, useState } from "react";
import clsx from "clsx";
import { prisma } from "@prisma/client";

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

export default function App() {
  const transition = useTransition();
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <SSRProvider>
      <html lang="en">
        <head>
          <Meta />
          <Links />
        </head>
        <body className="mt-1/5 relative flex h-full min-h-screen flex-col items-center bg-white">
          <section className="fixed top-0 z-10 mx-auto w-full bg-black text-center shadow-xl">
            <Form
              method="get"
              action="/search"
              className={clsx(
                "container my-8 mx-auto w-full px-4 transition-all duration-200 lg:max-w-3xl",
                scrollPosition > 10 ? "mt-4" : ""
              )}
            >
              <label htmlFor="query">
                <h1
                  className={clsx(
                    "block text-5xl text-[red] transition-all duration-200 sm:text-6xl md:text-7xl lg:text-8xl",
                    scrollPosition > 10
                      ? "mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
                      : "mb-8"
                  )}
                >
                  Canceled or Not
                </h1>
              </label>
              <div className="flex w-full gap-4">
                <input
                  type="search"
                  name="query"
                  className="w-auto flex-1 rounded-lg bg-white p-2 lg:text-xl"
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
          <div className="container mx-auto mt-48">
            <Outlet />
          </div>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    </SSRProvider>
  );
}
