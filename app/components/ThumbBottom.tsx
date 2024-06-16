import React, { useRef } from 'react';
import cx from 'clsx';
import useOnScreen from '../hooks/useOnScreen';

function ThumbBottom({
  item,
  isActive,
  onClick,
}: {
  item: Image;
  isActive: boolean;
  onClick: (path: string) => () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const isVisible = useOnScreen(ref);

  return (
    <button
      ref={ref}
      className={cx('h-full relative cursor-pointer button-w-action border border-transparent aspect-video', {
        '!border-neutral-300': isActive,
        'bg-opacity-5': !isActive,
      })}
      onClick={onClick(item.path)}
    >
      {isVisible && (
        <>
          <img src={item.thumb} className={cx('h-full object-cover w-full')} />
          <div
            className={cx('absolute left-0 top-0 right-0 bottom-0', {
              hidden: isActive,
              'bg-black bg-opacity-60': !isActive,
            })}
          ></div>
        </>
      )}
    </button>
  );
}

export default React.memo(ThumbBottom);
