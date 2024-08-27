'use client';

import Link from 'next/link';
import cx from 'clsx';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarredIcon } from '@heroicons/react/16/solid';
import { ArrowDownTrayIcon } from '@heroicons/react/20/solid';
import { Checkbox } from 'flowbite-react';
import { memo } from 'react';
import { toggleStar } from '@/app/server/actions';
import { useRouter } from 'next/navigation';
import useEvent from '../hooks/useEvent';
import download from '../server/ClientDownloader';
import useTaps from '../hooks/useTaps';
interface Props {
  image: Image;
  state: {
    isListView: boolean;
  };
  selectImage: () => void;
  isSelected: boolean;
  onParentclick: (event: React.MouseEvent<Element>) => void;
  pathname: string;
  isMobileDevice: boolean;
}

function Thumb(props: Props) {
  const { image, state, selectImage, isSelected, onParentclick, isMobileDevice } = props;
  const isStarred = image.isStar;
  const router = useRouter();

  const onClickStar = useEvent(() => {
    toggleStar(image.folder, image.filename, !isStarred);
    router.refresh();
  });

  const onClickDownload = useEvent(() => {
    download(image.path);
  });

  const taps = useTaps({
    onSingleTap: onParentclick,
    onDoubleTap: onClickStar,
    threshHold: !isMobileDevice ? 0 : 250,
  });

  return (
    <div
      className={cx('relative select-none cursor-pointer', {
        'group/thumb': !isMobileDevice,
      })}
      onClick={taps}
    >
      <div className={cx({ 'flex gap-2 items-center': state.isListView })}>
        <img
          src={image.thumb}
          alt="Image"
          className={cx('rounded object-cover', {
            'h-40': !state.isListView,
            '!w-12 h-12': state.isListView,
          })}
          style={{
            width: '100%',
          }}
        />
      </div>
      <div
        className={cx({
          hidden: !state.isListView,
          'flex-1 flex gap-6 px-2': state.isListView,
        })}
      >
        <div>2024-01-01 12:00</div>
      </div>
      <div
        className={cx(
          'group-hover/thumb:flex hidden',
          'rounded flex-col justify-between',
          // 'bg-neutral-950 bg-opacity-75',
          'absolute w-full h-full left-0 top-0 right-0 bottom-0',
          {
            '!flex !bg-opacity-0 hover:!bg-opacity-75': isSelected || isStarred,
            'bg-neutral-950 bg-opacity-75': !isMobileDevice,
          }
        )}
      >
        <div className={cx('px-1 pt-1')}>
          <Checkbox
            checked={isSelected}
            onChange={selectImage}
            className={cx('group-hover/thumb:block hidden button-w-action', {
              '!block': isSelected,
            })}
          />
        </div>
        <div
          className={cx('items-center justify-center w-full flex gap-1.5', {
            hidden: isMobileDevice,
          })}
        >
          <button
            className={cx(
              'group-hover/thumb:block hidden button-w-action transition-all',
              'p-2 rounded-full',
              'border-1 border-neutral-100 bg-neutral-500 bg-opacity-75 text-neutral-200 ',
              'hover:bg-opacity-100 hover:scale-105'
            )}
            onClick={onClickDownload}
          >
            <ArrowDownTrayIcon className="w-5" />
          </button>
        </div>
        <div
          className={cx('group-hover/thumb:block hidden', 'px-1', {
            '!block': isStarred,
          })}
        >
          <button onClick={onClickStar} className="button-w-action">
            {isStarred ? (
              <div className="bg-yellow-300 rounded-full p-0.5">
                <StarredIcon className="w-4 h-4 text-yellow-600" />
              </div>
            ) : (
              <div className="p-0.5">
                <StarIcon className="w-4 h-4 text-neutral-300 hover:text-yellow-400" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(Thumb);
