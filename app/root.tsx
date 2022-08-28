import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Form,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useTransition,
} from "@remix-run/react";
import { SSRProvider } from "react-aria";

import clsx from "clsx";
import { useEffect, useState } from "react";
import globalStyleSheet from "./styles/global.css";
import tailwindStylesheetUrl from "./styles/tailwind.css";

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
  return (
    <SSRProvider>
      <html lang="en">
        <head>
          <Meta />
          <Links />
          <link
            rel="icon"
            href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2285%22>🚫</text></svg>"
          />
        </head>
        <body className="relative flex h-full min-h-screen flex-col items-center bg-white ">
          <section className="fixed top-0 z-10 mx-auto w-full bg-stone-900 text-center shadow-xl">
            <Form
              method="get"
              action="/search"
              className={clsx(
                "container my-8 mx-auto w-full px-4 transition-all duration-200 lg:max-w-3xl"
              )}
            >
              <label htmlFor="query">
                <a
                  href="/
                "
                >
                  <h1 className="mb-8 block text-5xl font-bold uppercase text-red-600 transition-all duration-200 sm:text-4xl md:text-5xl lg:text-6xl">
                    Canceled or Not
                  </h1>
                </a>
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
          <div className="container mx-auto mt-60 px-4 text-stone-900">
            <Outlet />
          </div>
          <footer className="mt-16 w-full bg-stone-900 px-4 py-16"></footer>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    </SSRProvider>
  );
}
