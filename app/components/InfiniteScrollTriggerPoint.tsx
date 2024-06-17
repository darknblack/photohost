'use client';

import React, { useEffect, useRef } from 'react';
import useOnScreen from '@/app/hooks/useOnScreen';

interface Props {
  cb: () => void; // useEvent callback
}

function InfiniteScrollTriggerPoint(props: Props) {
  const { cb } = props;

  const rootRef = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(rootRef);

  useEffect(() => {
    if (isVisible) {
      cb();
    }
  }, [isVisible]);

  return <div ref={rootRef} className="h-2 w-full invisible"></div>;
}

export default React.memo(InfiniteScrollTriggerPoint);
