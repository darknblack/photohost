'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import cx from 'clsx';
import React from 'react';
import useEvent from '../hooks/useEvent';

interface Props {
  activeImageUrl: string;
  images: Image[];
  selectPreviewImageUrl: (url: string) => void;
}

function Preview(props: Props) {
  const { activeImageUrl, selectPreviewImageUrl, images } = props;

  const onClose = useEvent(() => {
    selectPreviewImageUrl('');
  });

  const onWhiteSpaceClick = useEvent((event: React.MouseEvent) => {
    const target = event.target as HTMLImageElement | HTMLDivElement;
    if (target.classList.contains('button-w-action')) return;

    onClose();
  });

  if (!activeImageUrl) return null;

  return (
    <div
      className={cx(
        'flex flex-col fixed left-0 top-0 right-0 bottom-0 bg-black bg-opacity-70 backdrop-blur animate-backdrop-blur select-none'
      )}
    >
      <div className="h-full flex flex-col gap-2 p-3">
        <div
          className="w-full flex-1 h-0 flex justify-center items-center cursor-pointer !pointer-events-auto"
          tabIndex={0}
          onClick={onWhiteSpaceClick}
        >
          <div className="h-full relative">
            <button
              className={cx(
                'absolute right-2 top-2 text-center h-8 w-8 flex justify-center items-center rounded-full text-neutral-300 button-w-action bg-neutral-800 bg-opacity-60 transition-all duration-75',
                'hover:bg-opacity-100 hover:text-neutral-100'
              )}
              onClick={onClose}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <img src={activeImageUrl} className="h-full cursor-default button-w-action" />
          </div>
        </div>
        <div className="h-[6%] flex justify-center gap-1">
          <ThumbsBottom images={images} activeImageUrl={activeImageUrl} selectPreviewImageUrl={selectPreviewImageUrl} />
        </div>
      </div>
    </div>
  );
}

function ThumbsBottom(props: Props) {
  const { images, activeImageUrl, selectPreviewImageUrl } = props;
  const onClick = useEvent((path: string) => () => {
    selectPreviewImageUrl(path);
  });

  return images.map(item => {
    const isActive = activeImageUrl === item.path;
    return (
      <button
        key={item.path}
        className={cx('h-full relative cursor-pointer button-w-action border border-transparent', {
          '!border-neutral-300': isActive,
          'bg-opacity-5': !isActive,
        })}
        onClick={onClick(item.path)}
        tabIndex={0}
      >
        <img key={item.path} src={item.thumb} className="h-full object-cover aspect-video" />
        <div
          className={cx('absolute left-0 top-0 right-0 bottom-0', {
            hidden: isActive,
            'bg-black bg-opacity-60': !isActive,
          })}
        ></div>
      </button>
    );
  });
}

export default React.memo(Preview);
