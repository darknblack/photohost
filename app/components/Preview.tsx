'use client';

import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import cx from 'clsx';
import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import useEvent from '@/app/hooks/useEvent';
import { ArrowDownTrayIcon } from '@heroicons/react/20/solid';
import download from '@/app/server/ClientDownloader';
import ThumbBottom from './ThumbBottom';
import useWindowSize from '../hooks/useWindowSize';
import InfiniteScrollTriggerPoint from './InfiniteScrollTriggerPoint';
interface Props {
  activeImageUrl: string;
  images: Image[];
  selectPreviewImageUrl: (url: string) => void;
  onInfiniteScrollTriggerPoint: () => void; // useEvent
  isPendingNewImages: boolean;
}

function Preview(props: Props) {
  const { activeImageUrl, selectPreviewImageUrl, images, onInfiniteScrollTriggerPoint, isPendingNewImages } = props;
  const thumbsRootRef = useRef<HTMLDivElement>(null);
  const size = useWindowSize();
  const isInitialOpening = useRef(true);

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

  const activeIndex = useMemo(() => images.findIndex(item => item.path === activeImageUrl), [activeImageUrl, images]);

  const goLeft = useEvent(() => {
    if (activeIndex > 0) {
      selectPreviewImageUrl(images[activeIndex - 1].path);
    }
  });

  const goRight = useEvent(() => {
    if (activeIndex < images.length - 1) {
      selectPreviewImageUrl(images[activeIndex + 1].path);
    }
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (activeImageUrl) {
        if (event.key === 'Escape' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
        }
        if (event.key === 'Escape') onClose();
        if (event.key === 'ArrowLeft') goLeft();
        if (event.key === 'ArrowRight') goRight();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activeImageUrl]);

  useLayoutEffect(() => {
    const thumbsRootDivEl = thumbsRootRef.current;
    const buttonEl = thumbsRootRef.current?.children[activeIndex] as HTMLButtonElement;
    if (!thumbsRootDivEl || !buttonEl) return;

    const rect = buttonEl.getBoundingClientRect();
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const offsetLeft = buttonEl.offsetLeft + rect.width / 2 + scrollBarWidth / 2;
    const windowWidthHalf = window.innerWidth / 2;

    thumbsRootDivEl.style.transform = `translateX(${(offsetLeft - windowWidthHalf) * -1}px)`;

    if (!isInitialOpening.current && !thumbsRootDivEl.classList.contains('transition-all')) {
      thumbsRootDivEl.classList.add('transition-all');
      thumbsRootDivEl.classList.add('duration-300');
    }

    buttonEl.focus();
    isInitialOpening.current = false;
  }, [activeIndex, size]);

  const onClickThumb = useEvent((path: string) => () => {
    selectPreviewImageUrl(path);
  });

  return (
    <div
      className={cx(
        'flex flex-col justify-center fixed left-0 top-0 right-0 bottom-0 bg-black bg-opacity-70 backdrop-blur animate-backdrop-blur select-none z-20'
      )}
    >
      <div className="h-full flex flex-col gap-2">
        <div
          className="w-full flex-1 h-0 flex justify-center items-center cursor-pointer !pointer-events-auto pt-2"
          onClick={onWhiteSpaceClick}
        >
          <div className="h-full relative pointer-events-none flex items-center justify-center px-2">
            <img src={activeImageUrl} className="max-h-full cursor-default button-w-action" />
          </div>

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

          <div className="absolute h-full px-4 w-full top-0 left-0 right-0 flex items-center justify-between pointer-events-none">
            <LeftRightButtonNavWrapper isInvisible={activeIndex === 0} onClick={goLeft}>
              <ChevronLeftIcon className={cx('w-6 h-6')} />
            </LeftRightButtonNavWrapper>
            <LeftRightButtonNavWrapper isInvisible={activeIndex === images.length - 1} onClick={goRight}>
              <ChevronRightIcon className={cx('w-6 h-6')} />
            </LeftRightButtonNavWrapper>
          </div>
        </div>

        <div ref={thumbsRootRef} className="h-[6%] flex gap-1 pb-2">
          {images.map(item => {
            const isActive = activeImageUrl === item.path;
            return <ThumbBottom key={item.path} item={item} isActive={isActive} onClick={onClickThumb} />;
          })}
          {!isPendingNewImages && <InfiniteScrollTriggerPoint cb={onInfiniteScrollTriggerPoint} />}
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

export default React.memo(Preview);
