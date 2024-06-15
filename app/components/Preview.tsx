'use client';
import cx from 'clsx';

interface Props {
  activeImageUrl: string;
  selectPreviewImageUrl: (url: string) => void;
}

export default function Preview(props: Props) {
  const { activeImageUrl, selectPreviewImageUrl } = props;

  if (!activeImageUrl) return null;

  return (
    <div
      className={cx(
        'flex flex-col absolute left-0 top-0 right-0 bottom-0 bg-black bg-opacity-10 backdrop-blur select-none'
      )}
    >
      <div className="h-full w-full p-4">
        <div
          className="h-full w-full flex items-center justify-center cursor-pointer"
          tabIndex={0}
          onClick={event => {
            const target = event.target as HTMLImageElement | HTMLDivElement;

            if (target.id === 'image-preview') {
              return;
            }

            selectPreviewImageUrl('');
          }}
        >
          <img src={activeImageUrl} className="max-w-full max-h-full cursor-default" id="image-preview" />
        </div>
      </div>
    </div>
  );
}
