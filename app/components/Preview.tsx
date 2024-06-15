'use client';
import { XCircleIcon } from '@heroicons/react/24/outline';
import cx from 'clsx';

interface Props {
  activeImageUrl: string;
  images: Image[];
  selectPreviewImageUrl: (url: string) => void;
}

export default function Preview(props: Props) {
  const { activeImageUrl, selectPreviewImageUrl, images } = props;

  if (!activeImageUrl) return null;

  return (
    <div
      className={cx(
        'flex flex-col absolute left-0 top-0 right-0 bottom-0 bg-black bg-opacity-10 backdrop-blur select-none'
      )}
    >
      <div className="h-full w-full p-4">
        <div
          className="h-full w-full flex flex-col gap-4 items-center justify-center cursor-pointer"
          tabIndex={0}
          onClick={event => {
            const target = event.target as HTMLImageElement | HTMLDivElement;

            if (target.id === 'image-preview' || target.classList.contains('preview-thumbs')) {
              return;
            }

            selectPreviewImageUrl('');
          }}
        >
          <div className="max-h-[86vh] relative ">
            <div className="absolute right-2 top-2 hover:bg-gray-600 hover:text-gray-300 bg-transparent text-center leading-10 h-10 w-10 rounded-full text-neutral-800">
              <XCircleIcon className="w-10 h-10 " />
            </div>

            <img src={activeImageUrl} className="max-h-full cursor-default" id="image-preview" />
          </div>
          <div className="flex gap-2">
            {images.map(item => {
              return (
                <img
                  onClick={() => {
                    selectPreviewImageUrl(item.path);
                  }}
                  key={item.path}
                  src={item.thumb}
                  className="w-12 h-12 preview-thumbs cursor-pointer"
                  style={{
                    objectFit: 'cover', // TODO: experiment with scale-down option
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
