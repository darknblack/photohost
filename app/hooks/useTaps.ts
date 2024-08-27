import { useCallback, useRef } from 'react';

type RMEvent = React.MouseEvent<Element>;
interface Props {
  onSingleTap?: (event: RMEvent) => void;
  onDoubleTap?: (event: RMEvent) => void;
  onLongPress?: (event: RMEvent) => void;
  threshHold?: number;
}

const defaultThreshold = 250;

function useTaps(props: Props): (event: RMEvent) => void {
  const timer = useRef<NodeJS.Timeout | null>(null);
  const handler = useCallback(
    (event: RMEvent) => {
      if (!timer.current) {
        timer.current = setTimeout(() => {
          props.onSingleTap?.(event);
          timer.current = null;
        }, props.threshHold ?? defaultThreshold);
      } else {
        clearTimeout(timer.current);
        timer.current = null;
        props.onDoubleTap?.(event);
      }
    },
    [props]
  );

  return handler;
}

export default useTaps;
