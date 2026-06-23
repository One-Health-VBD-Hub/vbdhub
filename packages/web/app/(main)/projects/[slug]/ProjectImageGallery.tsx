'use client';

import Image from 'next/image';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

export default function ProjectImageGallery({
  images
}: {
  images: {
    src: string;
    alt: string;
    width: number;
    height: number;
    caption: string;
  }[];
}) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {images.map((image) => (
        <figure key={image.src}>
          <Zoom>
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className='aspect-[4/3] w-full object-cover shadow'
            />
          </Zoom>
          <figcaption className='mt-2 text-sm text-gray-600'>
            {image.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
