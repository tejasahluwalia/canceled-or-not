import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
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
        imageUrl: entity.thumbnail?.source ?? null,
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
    const queryURL = `https://en.wikipedia.org/w/api.php?action=query&generator=prefixsearch&gpssearch=${query}&prop=pageimages&utf8=&format=json&formatversion=2&gpslimit=10`;
    const res = await fetch(queryURL);
    return json(await res.json());
  } else {
    return null;
  }
};

export default function Search() {
  const searchQueryResults = useLoaderData<LoaderData>();

  if (searchQueryResults) {
    const suggestions = Object.values(searchQueryResults.query.pages).sort(
      (a, b) => a.index - b.index
    );
    return (
      <form method="post" action="/search">
        {suggestions.map((page) => (
          <button
            name="entity"
            type="submit"
            key={page.pageid}
            value={JSON.stringify(page)}
            autoFocus={page.index === 1}
          >
            {page.thumbnail && (
              <img
                src={page.thumbnail.source}
                alt={page.pageimage}
                className="aspect-square w-12 object-cover"
              />
            )}
            {page.title}
          </button>
        ))}
      </form>
    );
  } else {
    return null;
  }
}
