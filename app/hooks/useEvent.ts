import { useLayoutEffect, useRef } from 'react';

type Fn<A extends any[], R> = (...args: A) => R;
type EventRef<T> = { callback: T; stable: T };

/**
 * A Hook to define an event handler with an always-stable function identity. Aimed to be easier to use than useCallback.
 * useEffectEvent (experimental) instead if event is only used as part of useEffect logic.
 * See https://react.dev/learn/separating-events-from-effects#declaring-an-effect-event
 */
function useEvent<A extends any[], R>(callback: Fn<A, R>): Fn<A, R> {
  // @ts-ignore
  let ref = useRef<EventRef<Fn<A, R>>>({
    // @ts-ignore
    stable: (...args) => ref.current.callback(...args),
    callback,
  });

  useLayoutEffect(() => {
    ref.current.callback = callback;
  });

  return ref.current.stable;
}

export default useEvent;
