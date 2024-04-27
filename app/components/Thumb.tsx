'use client';
import Link from 'next/link';
import cx from 'clsx';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarredIcon } from '@heroicons/react/16/solid';
import { ArrowDownTrayIcon } from '@heroicons/react/20/solid';
import { Checkbox } from 'flowbite-react';
import { useState } from 'react';
interface Props {
  image: Image;
  state: {
    isListView: boolean;
  };
}

function Thumb(props: Props) {
  const { image, state } = props;
  const [isChecked, setIsChecked] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  return (
    <div className="relative group/root">
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
      <div className="group-hover/root:flex hidden rounded bg-neutral-950 bg-opacity-70 absolute w-full h-full left-0 top-0 right-0 bottom-0 flex-col justify-between">
        <div className="px-1.5 py-0.5">
          <Checkbox checked={isChecked} onChange={() => setIsChecked(!isChecked)} />
        </div>
        <div className="flex items-center justify-center w-full">
          <Link
            key={image.path}
            href={image.path}
            className={cx(
              'p-2 border-1 border-neutral-100 bg-white text-neutral-950 bg-opacity-70 rounded-full hover:bg-opacity-100'
            )}
            target="_blank"
            prefetch={false}
          >
            <ArrowDownTrayIcon className="w-5" />
          </Link>
        </div>
        <div className="px-1 pb-0.5">
          <button onClick={() => setIsStarred(!isStarred)}>
            {isStarred ? (
              <StarredIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <StarIcon className="w-5 h-5 text-neutral-200" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Thumb;
