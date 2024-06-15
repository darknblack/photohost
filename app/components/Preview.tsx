'use client';
import { XCircleIcon } from '@heroicons/react/24/outline';
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

  if (!activeImageUrl) return null;

  const onClose = useEvent(() => {
    selectPreviewImageUrl('');
  });

  const onWhiteSpaceClick = useEvent((event: React.MouseEvent) => {
    const target = event.target as HTMLImageElement | HTMLDivElement;
    if (target.classList.contains('button-w-action')) return;

    onClose();
  });

  return (
    <div
      className={cx(
        'flex flex-col fixed left-0 top-0 right-0 bottom-0 bg-black bg-opacity-10 backdrop-blur select-none'
      )}
    >
      <div className="h-full">
        <div className="h-full flex flex-col items-center justify-center gap-2 p-3">
          <div
            className="h-[94%] w-full flex justify-center items-center cursor-pointer !pointer-events-auto"
            tabIndex={0}
            onClick={onWhiteSpaceClick}
          >
            <div className="h-full relative">
              <button
                className="absolute right-2 top-2 hover:bg-gray-600 hover:text-gray-300 bg-transparent text-center leading-10 h-10 w-10 rounded-full text-neutral-900 button-w-action"
                onClick={onClose}
              >
                <XCircleIcon className="w-10 h-10" />
              </button>
              <img src={activeImageUrl} className="max-h-full cursor-default button-w-action" />
            </div>
          </div>
          <div className="h-[6%] flex gap-2">
            <ThumbsBottom
              images={images}
              activeImageUrl={activeImageUrl}
              selectPreviewImageUrl={selectPreviewImageUrl}
            />
          </div>
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
      <img
        onClick={onClick(item.path)}
        key={item.path}
        src={item.thumb}
        className={cx('h-full object-cover aspect-video button-w-action cursor-pointer border border-transparent', {
          '!border-neutral-300': isActive,
        })}
      />
    );
  });
}

export default React.memo(Preview);
