import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { userCookie } from "~/cookie";
import { getEntity } from "~/models/entity.server";
import { createVote } from "~/models/vote.server";

type LoaderData = Awaited<ReturnType<typeof getEntity>>;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  let entityId = formData.get("entityId");
  let voteValue = formData.get("vote");
  const cookieHeader = request.headers.get("Cookie");
  const { userId } = await userCookie.parse(cookieHeader);
  invariant(typeof entityId === "string", "entityId is required");
  invariant(typeof voteValue === "string", "vote is required");
  invariant(userId, "userId is required");
  await createVote({
    entityId: parseInt(entityId),
    value: parseInt(voteValue),
    userId,
  });
  return null;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { slug } = params;
  if (slug) {
    const entity = await getEntity({ slug });
    return entity;
  } else {
    return null;
  }
};

export const meta: MetaFunction = ({ data }) => {
  if (!data) {
    return {
      title: "Not found",
      description: "Not found",
    };
  }

  return {
    title: `Is ${data.name} canceled?`,
    description: `Find out if ${data.name} has been canceled!`,
  };
};

export default function Entity() {
  const entity = useLoaderData<LoaderData>();
  if (!entity) {
    return <>Page not found</>;
  } else {
    return (
      <section>
        <h1>{entity?.name}</h1>
        {entity?.imageUrl && (
          <img
            src={entity?.imageUrl}
            alt={`Image of ${entity.name} from Wikipedia`}
          />
        )}
        <div>
          <h2>Rating</h2>
          <div>{entity.rating?.distribution}</div>
          <form method="post">
            <label htmlFor="vote">
              What is your rating?
              <input
                type="range"
                name="vote"
                id="vote"
                min={1}
                max={10}
                step={1}
              />
            </label>
            <input type="hidden" name="entityId" value={entity.id} />
            <button type="submit">Submit</button>
          </form>
        </div>
      </section>
    );
  }
}
