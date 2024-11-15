import React, { useRef } from 'react';
import cx from 'clsx';
import useOnScreen from '../hooks/useOnScreen';

function ThumbBottom({
  item,
  isActive,
  onClick,
}: {
  item: PhotoRecord;
  isActive: boolean;
  onClick: (path: string) => () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const isVisible = useOnScreen(ref);

  return (
    <button
      ref={ref}
      className={cx('h-full relative cursor-pointer button-w-action aspect-video', {
        'bg-opacity-5': !isActive,
      })}
      onClick={onClick(item.thumbnails.large)}
    >
      {isVisible && (
        <>
          <img src={item.thumbnails.small} className={cx('h-full object-cover w-full')} alt="thumb" />
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
