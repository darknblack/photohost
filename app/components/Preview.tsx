'use client';

import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import cx from 'clsx';
import React, { useEffect } from 'react';
import useEvent from '@/app/hooks/useEvent';
import { ArrowDownTrayIcon } from '@heroicons/react/20/solid';
import download from '@/app/server/ClientDownloader';
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

  const onClickDownload = useEvent(() => {
    download(activeImageUrl);
  });

  const onWhiteSpaceClick = useEvent((event: React.MouseEvent) => {
    const target = event.target as HTMLImageElement | HTMLDivElement;
    if (target.classList.contains('button-w-action')) return;

    onClose();
  });

  const activeIndex = images.findIndex(item => item.path === activeImageUrl);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && activeImageUrl) {
        if (event.key === 'ArrowLeft' && activeIndex > 0) {
          event.preventDefault();
          selectPreviewImageUrl(images[activeIndex - 1].path);
        }
        if (event.key === 'ArrowRight' && activeIndex < images.length - 1) {
          event.preventDefault();
          selectPreviewImageUrl(images[activeIndex + 1].path);
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [activeIndex, images, activeImageUrl]);

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
          <div className="h-full relative pointer-events-none flex items-center justify-center">
            <img src={activeImageUrl} className="max-h-full cursor-default button-w-action" />
            <div className="absolute flex top-0 left-0 pt-2 px-2 justify-end w-full">
              <div className="flex gap-1.5">
                <TopButtonWrapper onClick={onClickDownload}>
                  <ArrowDownTrayIcon className="w-6 h-6" />
                </TopButtonWrapper>
                <TopButtonWrapper onClick={onClose}>
                  <XMarkIcon className="w-6 h-6" />
                </TopButtonWrapper>
              </div>
            </div>
          </div>

          <div className="absolute h-full px-4 w-full top-0 left-0 right-0 flex items-center justify-between pointer-events-none">
            <LeftRightButtonNavWrapper
              isInvisible={activeIndex === 0}
              onClick={() => selectPreviewImageUrl(images[activeIndex - 1].path)}
            >
              <ChevronLeftIcon className={cx('w-6 h-6')} />
            </LeftRightButtonNavWrapper>
            <LeftRightButtonNavWrapper
              isInvisible={activeIndex === images.length - 1}
              onClick={() => selectPreviewImageUrl(images[activeIndex + 1].path)}
            >
              <ChevronRightIcon className={cx('w-6 h-6')} />
            </LeftRightButtonNavWrapper>
          </div>
        </div>

        <div className="h-[6%] flex flex-grow-0 justify-center gap-1">
          <ThumbsBottom images={images} activeImageUrl={activeImageUrl} selectPreviewImageUrl={selectPreviewImageUrl} />
        </div>
      </div>
    </div>
  );
}

function TopButtonWrapper({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className={cx(
        'text-center p-2 h-9 w-9 flex justify-center items-center rounded-full text-neutral-300 button-w-action bg-neutral-800 bg-opacity-60 transition-all',
        'hover:bg-opacity-100 hover:text-neutral-100 hover:scale-105'
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function LeftRightButtonNavWrapper({
  children,
  isInvisible,
  onClick,
}: {
  children: React.ReactNode;
  isInvisible: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cx(
        'button-w-action p-2 bg-neutral-800 text-neutral-300 bg-opacity-45 rounded-full transition-all',
        'hover:bg-opacity-100 hover:text-neutral-100 hover:translate hover:scale-105',
        { invisible: isInvisible }
      )}
      onClick={onClick}
    >
      {children}
    </button>
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
        className={cx('h-full relative cursor-pointer button-w-action border border-transparent aspect-video', {
          '!border-neutral-300': isActive,
          'bg-opacity-5': !isActive,
        })}
        onClick={onClick(item.path)}
        tabIndex={0}
      >
        <img src={item.thumb} className="h-full object-cover w-full" />
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
