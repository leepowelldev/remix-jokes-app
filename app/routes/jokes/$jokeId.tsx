import { Joke } from '@prisma/client';
import {
  ActionFunction,
  Link,
  LoaderFunction,
  MetaFunction,
  redirect,
  useCatch,
  useLoaderData,
  useParams,
} from 'remix';
import invariant from 'tiny-invariant';
import { db } from '~/utils/db.server';
import { getUserId, requireUserId } from '~/utils/session.server';

export let meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => {
  if (!data) {
    return {
      title: 'No joke',
      description: 'No joke found',
    };
  }
  return {
    title: `"${data.joke.name}" joke`,
    description: `Enjoy the "${data.joke.name}" joke and much more`,
  };
};

type LoaderData = {
  joke: Joke;
  isOwner: boolean;
};

export const loader: LoaderFunction = async ({
  request,
  params,
}): Promise<LoaderData | Response> => {
  const userId = await getUserId(request);
  const joke = await db.joke.findUnique({
    where: {
      id: params.jokeId,
    },
  });

  if (!joke) {
    throw new Response('What a joke! Not found.', {
      status: 404,
    });
  }

  const data = {
    joke,
    isOwner: userId === joke.jokesterId,
  };

  return data;
};

type ActionData = {};

export const action: ActionFunction = async ({ request, params }) => {
  throw new Response('Should my CatchBoundary catch this?', { status: 418 });

  const formData = await request.formData();
  const method = formData.get('_method');

  invariant(typeof method === 'string');
  invariant(typeof params.jokeId === 'string');

  if (method === 'delete') {
    const userId = await requireUserId(request);

    const joke = await db.joke.findUnique({
      where: { id: params.jokeId },
    });

    if (!joke) {
      throw new Response("Can't delete what does not exist", { status: 404 });
    }

    if (joke.jokesterId !== userId) {
      throw new Response("Pssh, nice try. That's not your joke", {
        status: 401,
      });
    }

    await db.joke.delete({ where: { id: params.jokeId } });
    return redirect('/jokes');
  }
};

export default function JokeRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{data.joke.content}</p>
      <Link to=".">{data.joke.name} Permalink</Link>
      {/* {data.isOwner ? ( */}
      <form method="post">
        <input type="hidden" name="_method" value="delete" />
        <button type="submit" className="button">
          Delete
        </button>
      </form>
      {/* ) : null} */}
    </div>
  );
}

export function CatchBoundary() {
  let caught = useCatch();
  let params = useParams();
  switch (caught.status) {
    case 404: {
      return (
        <div className="error-container">
          Huh? What the heck is {params.jokeId}?
        </div>
      );
    }
    case 401: {
      return (
        <div className="error-container">
          Sorry, but {params.jokeId} is not your joke.
        </div>
      );
    }
    default: {
      throw new Error(`Unhandled error: ${caught.status}`);
    }
  }
}

export function ErrorBoundary() {
  let { jokeId } = useParams();
  return (
    <div className="error-container">{`There was an error loading joke by the id ${jokeId}. Sorry.`}</div>
  );
}
