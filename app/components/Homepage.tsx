'use client';

import { useEffect, useState } from 'react';

interface Props {
  images: Images[];
}
const Homepage = (props: Props) => {
  const { images } = props;

  return (
    <div className="flex gap-2 p-2">
      {images.map((image, i) => (
        <div key={image.path} className="w-1/4 h-auto">
          <img src={image.path} className="rounded" />
        </div>
      ))}
    </div>
  );
};

export default Homepage;
