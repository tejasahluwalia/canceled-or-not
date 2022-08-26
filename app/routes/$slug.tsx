import {
  ActionFunction,
  json,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useMemo } from "react";
import { AxisOptions, Chart } from "react-charts";
import invariant from "tiny-invariant";
import { userCookie } from "~/cookie";
import { getEntity } from "~/models/entity.server";
import { getUser, createUser } from "~/models/user.server";
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
  const cookieHeader = request.headers.get("Cookie");
  if (cookieHeader) {
    let id = await userCookie.parse(cookieHeader);
    if (id) {
      let currentUser = await getUser({
        id: id.userId,
      });
      if (!currentUser) {
        let newUser = await createUser();
        if (slug) {
          const entity = await getEntity({ slug });
          return json(entity, {
            headers: {
              "Set-Cookie": await userCookie.serialize({
                userId: newUser.id,
              }),
            },
          });
        }
      }
    }
    if (!id) {
      let newUser = await createUser();
      if (slug) {
        const entity = await getEntity({ slug });
        return json(entity, {
          headers: {
            "Set-Cookie": await userCookie.serialize({ userId: newUser.id }),
          },
        });
      }
    }
  } else {
    let newUser = await createUser();
    if (slug) {
      const entity = await getEntity({ slug });
      return json(entity, {
        headers: {
          "Set-Cookie": await userCookie.serialize({
            userId: newUser.id,
          }),
        },
      });
    }
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
  type RatingData = {
    rating: number;
    votes: number;
  };
  const primaryAxis = useMemo(
    (): AxisOptions<RatingData> => ({
      getValue: (datum) => datum.rating,
      tickCount: 10,
    }),
    []
  );
  const secondaryAxes = useMemo(
    (): AxisOptions<RatingData>[] => [
      {
        getValue: (datum) => datum.votes,
        show: false,
        stacked: true,
      },
    ],
    []
  );
  if (!entity) {
    return <>Page not found</>;
  } else {
    let ratingDistribution = JSON.parse(entity.rating!.distribution) as {
      [key: number]: number;
    };
    let data = [
      {
        label: "Rating Distribution",
        data: Object.entries(ratingDistribution).map(([rating, votes]) => ({
          rating: parseInt(rating),
          votes,
        })),
      },
    ];
    return (
      <section className="container mx-auto px-4">
        <div className="flex w-full flex-col items-center gap-8 py-8 md:flex-row md:py-16">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="mb-4 text-5xl font-bold uppercase">
              {entity?.name}
            </h2>
            {entity?.imageUrl && (
              <figure className="flex flex-col items-center md:items-start">
                <img
                  src={entity.imageUrl}
                  height="500"
                  className="aspect-[3/4] w-3/4 max-w-sm object-cover md:w-full"
                />
                {entity.descriptionUrl && (
                  <figcaption className="mt-2 text-sm text-gray-800 underline opacity-80 hover:opacity-100">
                    <a href={entity.descriptionUrl}>
                      Image source: Wikimedia Commons
                    </a>
                  </figcaption>
                )}
              </figure>
            )}
          </div>
          <div className="flex flex-1 flex-col items-center ">
            <h3 className="mb-4 text-center text-3xl font-bold uppercase md:mb-16">
              Public Opinion
            </h3>
            <div className="flex h-36 w-full md:h-72 md:w-3/4">
              <Chart
                options={{
                  data,
                  initialHeight: 300,
                  primaryAxis,
                  secondaryAxes,
                  primaryCursor: false,
                  secondaryCursor: false,
                  tooltip: false,
                  interactionMode: "primary",
                  getSeriesStyle: () => {
                    return {
                      color: `url(#svg-gradient)`,
                    };
                  },
                  renderSVG: () => (
                    <defs>
                      <linearGradient
                        id="svg-gradient"
                        x1="0"
                        x2="1"
                        y1="0"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#1E9600" />
                        <stop offset="50%" stopColor="#FFF200" />
                        <stop offset="100%" stopColor="#FF0000" />
                      </linearGradient>
                    </defs>
                  ),
                }}
              />
            </div>
          </div>
        </div>
        <div className="mb-4 bg-black p-8 text-white md:p-16">
          <form method="post" className="flex w-full flex-col items-center">
            <label htmlFor="vote" className="flex w-full flex-col items-center">
              <h3 className="text-center text-5xl font-bold uppercase">
                What do you think?
              </h3>
              <input
                className="rating-range my-16 mx-auto w-full max-w-4xl"
                type="range"
                name="vote"
                id="vote"
                min={1}
                max={10}
                step={1}
                defaultValue={1}
              />
            </label>
            <input type="hidden" name="entityId" value={entity.id} />
            <button
              className="mx-auto max-w-max rounded-lg border-2 border-gray-200 bg-gray-100 p-2 text-sm font-bold uppercase text-black lg:text-xl"
              type="submit"
            >
              Submit
            </button>
          </form>
        </div>
      </section>
    );
  }
}
