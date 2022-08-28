import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getPopularEntities } from "~/models/entity.server";

type LoaderData = Awaited<ReturnType<typeof getPopularEntities>>;

export const loader: LoaderFunction = async () => {
  return await getPopularEntities();
};

export default function Home() {
  const popularEntities = useLoaderData<LoaderData>();

  return (
    <section className="flex w-full flex-col gap-4">
      <h2 className="text-4xl font-bold uppercase">Popular right now</h2>
      <ul className="flex flex-col gap-4">
        {popularEntities.map((entity) => (
          <li key={entity.id}>
            <a
              href={entity.slug}
              className="flex items-center gap-4 border-4 border-black p-4 text-left text-2xl font-bold uppercase outline hover:outline-4 hover:outline-red-600 focus:border-red-600 focus:outline-4 focus:outline-red-600 sm:h-32"
            >
              {entity.imageUrl && (
                <img
                  src={entity.imageUrl}
                  className="aspect-square h-24 w-24 object-cover"
                />
              )}
              {entity.name}
              {entity._count.votes}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
