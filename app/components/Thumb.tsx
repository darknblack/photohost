'use client';
import Link from 'next/link';
import cx from 'clsx';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarredIcon } from '@heroicons/react/16/solid';
import { ArrowTopRightOnSquareIcon, ArrowDownTrayIcon } from '@heroicons/react/20/solid';
import { Checkbox } from 'flowbite-react';
import { memo } from 'react';
import { toggleStar } from '@/app/gallery/actions';
import { useRouter } from 'next/navigation';
interface Props {
  image: Image;
  state: {
    isListView: boolean;
  };
  selectImage: () => void;
  isSelected: boolean;
}

function Thumb(props: Props) {
  const { image, state, selectImage, isSelected } = props;
  const isStarred = image.isStar;
  const router = useRouter();

  return (
    <div className="relative group/thumb">
      <Link
        key={image.path}
        href={image.path}
        className={cx('', {
          'flex gap-2 items-center': state.isListView,
        })}
        target="_blank"
        prefetch={false}
      >
        <img
          src={image.thumb}
          alt="Image"
          className={cx('rounded', {
            'h-40': !state.isListView,
            '!w-12 h-12': state.isListView,
          })}
          style={{
            objectFit: 'cover', // TODO: experiment with scale-down option
            width: '100%',
          }}
        />
      </Link>
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
          'bg-neutral-950 bg-opacity-75',
          'absolute w-full h-full left-0 top-0 right-0 bottom-0',
          {
            '!flex !bg-opacity-0 hover:!bg-opacity-75': isSelected || isStarred,
          }
        )}
      >
        <div className={cx('px-1 pt-1')}>
          <Checkbox
            checked={isSelected}
            onChange={selectImage}
            className={cx('group-hover/thumb:block hidden', {
              '!block': isSelected,
            })}
          />
        </div>
        <div className="items-center justify-center w-full flex gap-1.5">
          <Link
            key={image.path}
            href={image.path}
            className={cx(
              'group-hover/thumb:block hidden',
              'p-2 rounded-md',
              'border-1 border-neutral-100 bg-neutral-500 bg-opacity-75 text-neutral-300 ',
              'hover:bg-opacity-100'
            )}
            target="_blank"
            prefetch={false}
          >
            <ArrowTopRightOnSquareIcon className="w-5" />
          </Link>
          <Link
            href={image.path}
            className={cx(
              'group-hover/thumb:block hidden',
              'p-2 rounded-md',
              'border-1 border-neutral-100 bg-neutral-500 bg-opacity-75 text-neutral-300 ',
              'hover:bg-opacity-100'
            )}
            target="_blank"
            prefetch={false}
          >
            <ArrowDownTrayIcon className="w-5" />
          </Link>
        </div>
        <div
          className={cx('group-hover/thumb:block hidden', 'px-1', {
            '!block': isStarred,
          })}
        >
          <button
            onClick={() => {
              toggleStar(image.folder, image.filename, !isStarred);
              router.refresh();
            }}
          >
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