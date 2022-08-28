import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { getEntity, createEntity } from "~/models/entity.server";
import { slugify } from "~/utils";

interface WikipediaPage {
  title: string;
  pageid: number;
  index: number;
  thumbnail?: {
    source: string;
  };
  pageimage?: string;
}

interface WikipediaQueryResponse {
  query: {
    pages: {
      [key: string]: WikipediaPage;
    };
  };
}

type LoaderData = Awaited<WikipediaQueryResponse>;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  let data = formData.get("entity");
  if (typeof data == "string") {
    let entity: WikipediaPage = JSON.parse(data);
    let slug = slugify(entity.title);
    const existingEntity = await getEntity({ slug });
    if (existingEntity) {
      return redirect(`/${slug}`);
    } else {
      await createEntity({
        wikipediaId: entity.pageid,
        pageImage: entity.pageimage ?? undefined,
        name: entity.title,
      });
      return redirect(`/${slug}`);
    }
  } else {
    return redirect("/");
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("query");

  if (query) {
    const queryURL = `https://en.wikipedia.org/w/api.php?action=query&generator=prefixsearch&gpssearch=${query}&prop=pageimages&piprop=thumbnail%7Cname&pithumbsize=300&utf8=&format=json&formatversion=latest&gpslimit=10`;
    const res = await fetch(queryURL);
    return json(await res.json());
  } else {
    return null;
  }
};

export default function Search() {
  const searchQueryResults = useLoaderData<LoaderData>();
  const transition = useTransition();

  if (searchQueryResults.query?.pages) {
    const suggestions = Object.values(searchQueryResults.query.pages).sort(
      (a, b) => a.index - b.index
    );
    return (
      <Form
        method="post"
        action="/search"
        className="container mx-auto mt-20 flex w-full flex-col gap-4 px-4 lg:max-w-3xl"
      >
        {suggestions.map((page) => (
          <button
            name="entity"
            type="submit"
            key={page.pageid}
            value={JSON.stringify(page)}
            autoFocus={page.index === 1}
            disabled={transition.state === "submitting"}
            className="flex items-center gap-4 border-4 border-black p-4 text-left text-2xl font-bold uppercase outline hover:outline-4 hover:outline-red-600 focus:border-red-600 focus:outline-4 focus:outline-red-600 sm:h-32"
          >
            {page.thumbnail && (
              <img
                src={page.thumbnail.source}
                alt={page.pageimage}
                className="aspect-square h-24 w-24 object-cover"
              />
            )}
            {page.title}
          </button>
        ))}
      </Form>
    );
  } else {
    return (
      <div className="container mx-auto mt-20 flex w-full flex-col gap-4 lg:max-w-3xl">
        <span className="text-center text-4xl">No Results Found</span>
      </div>
    );
  }
}
