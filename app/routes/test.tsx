import { useEffect, useLayoutEffect, useState } from 'react';
import type { PointerEventHandler, PointerEvent } from 'react';
import { LoaderFunction, useLoaderData, useLocation, useNavigate } from 'remix';
import { usePrevious } from 'react-use';

const isSSR = typeof window === 'undefined';

const useIsomorphicLayoutEffect = isSSR ? useEffect : useLayoutEffect;

// function useIsSSR() {
//   const [isSSR, setIsSSR] = useState(true);

//   useIsomorphicLayoutEffect(() => {
//     setIsSSR(false);
//   });

//   return isSSR;
// }

type ShowHideProps = {
  id: string;
  isOpen: boolean;
  title: string;
  content: string;
  onClick: PointerEventHandler<HTMLButtonElement>;
};

function ShowHide({
  isOpen,
  title,
  content,
  id,
  onClick = () => undefined,
}: ShowHideProps) {
  return (
    <div>
      <button
        type="button"
        aria-controls={id}
        aria-expanded={isOpen}
        onClick={onClick}
      >
        {title}
      </button>
      <div id={id} hidden={!isOpen}>
        {content}
      </div>
    </div>
  );
}

type LoaderData = {
  showHide1?: boolean;
  showHide2?: boolean;
};

export const loader: LoaderFunction = ({ request }): LoaderData => {
  const url = new URL(request.url);
  const data: Record<string, string | boolean> = Object.fromEntries(
    new URLSearchParams(url.search).entries()
  );

  Object.keys(data).forEach((key) => {
    data[key] = data[key] === 'true';
  });

  return data;
};

function useShowHideState(id: string, initialIsOpen: boolean = false) {
  const [isOpen, setIsOpen] = useState(true);
  // const prevState = usePrevious(state);
  // const navigate = useNavigate();
  // const location = useLocation();

  // useEffect(() => {
  //   if (state !== prevState && prevState !== undefined) {
  //     setIsOpen(state);
  //   }
  // });

  useIsomorphicLayoutEffect(() => {
    setIsOpen(initialIsOpen);
  }, []);

  const onClick = () => {
    const nextState = !isOpen;

    setIsOpen(nextState);

    // const urlSearchParams = new URLSearchParams(location.search);
    // urlSearchParams.set(id, String(nextState));
    // navigate(`?${urlSearchParams}`, {});
  };

  return {
    props: { isOpen, onClick },
  };
}

export default function JokesTestRoute() {
  const data = useLoaderData<LoaderData>();

  const { props: showHide1Props } = useShowHideState('showHide1', false);
  const { props: showHide2Props } = useShowHideState('showHide2', false);

  return (
    <>
      <ShowHide
        {...showHide1Props}
        title="Toggle"
        id="showhide1"
        content="Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt
    deleniti provident illo animi quos id vel maiores delectus, qui tempore?
    Veniam alias id quidem ex ratione voluptate ullam hic. Incidunt."
      />

      <ShowHide
        {...showHide2Props}
        title="Toggle"
        id="showhide2"
        content="Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt
    deleniti provident illo animi quos id vel maiores delectus, qui tempore?
    Veniam alias id quidem ex ratione voluptate ullam hic. Incidunt."
      />
    </>
  );
}
