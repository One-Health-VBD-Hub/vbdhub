import React from 'react';

const roadmapItems = [
  {
    id: 1,
    date: 'July 2024',
    datetime: '2024-07',
    title: 'Development start',
    details: (
      <ul className='list-inside list-disc text-left'>
        <li>Requirements gathering and analysis.</li>
        <li>UI/UX design prototyping.</li>
      </ul>
    ),
    status: 'completed'
  },
  {
    id: 2,
    date: 'December 2024',
    datetime: '2024-12',
    title: 'Soft launch',
    details: (
      <ul className='list-inside list-disc text-left'>
        <li>Occurrence, abundance, trait data search.</li>
        <li>SOPs for data types.</li>
      </ul>
    ),
    status: 'completed'
  },
  {
    id: 3,
    date: 'June 2025',
    datetime: '2025-06',
    title: 'Hard launch',
    details: (
      <ul className='list-inside list-disc text-left'>
        <li>Blog and newsletter.</li>
        <li>Forum for networking and discussion.</li>
        <li>
          Genomic, epidemiological, micro array, transcriptomic data search.
        </li>
      </ul>
    ),
    status: 'in-progress'
  },
  {
    id: 4,
    date: 'September 2025',
    datetime: '2025-09',
    title: 'Version 2 release',
    details: (
      <ul className='list-inside list-disc text-left'>
        <li>Direct data download.</li>
        <li>Mapping and charting functionality.</li>
        <li>Multi-language support.</li>
      </ul>
    ),
    status: 'upcoming'
  }
];

const ProductRoadmap = () => {
  return (
    <div className='relative p-8'>
      {/* Desktop Version: Horizontal Timeline */}
      <div className='hidden lg:block'>
        {/* Horizontal connector line */}
        <div className='absolute top-[46px] right-10 left-10 h-1 bg-[#f4f4f4]'></div>
        <div className='relative flex gap-4'>
          {roadmapItems.map((item) => {
            const circleColor =
              item.status === 'completed'
                ? 'bg-[#0f62fe]'
                : item.status === 'in-progress'
                  ? 'bg-blue-400'
                  : 'bg-[#f4f4f4]';

            return (
              <div key={item.id} className='flex flex-1 flex-col items-center'>
                <div
                  className={`h-8 w-8 ${circleColor} border-8 border-white`}
                />
                <div className='mt-4 w-full text-center'>
                  <p className='text-sm text-gray-600'>
                    <time dateTime={item.datetime}>{item.date}</time>
                  </p>
                  <h3 className='text-lg font-medium'>{item.title}</h3>
                  <div className='text-sm'>{item.details}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Version: Vertical Timeline */}
      <div className='block lg:hidden'>
        {/* Vertical connector line */}
        <div className='absolute top-10 bottom-10 left-[46.245px] w-1 bg-[#f4f4f4]'></div>
        <div className='relative flex flex-col space-y-8'>
          {roadmapItems.map((item) => {
            const circleColor =
              item.status === 'completed'
                ? 'bg-blue-600'
                : item.status === 'in-progress'
                  ? 'bg-blue-400'
                  : 'bg-[#f4f4f4]';

            return (
              <div key={item.id} className='flex items-center'>
                <div className='mr-4 flex flex-col items-center'>
                  <div
                    className={`h-8 w-8 ${circleColor} border-8 border-white`}
                  />
                </div>
                <div className='text-left'>
                  <p className='text-sm text-gray-600'>
                    <time dateTime={item.datetime}>{item.date}</time>
                  </p>
                  <h3 className='text-lg font-semibold text-gray-800'>
                    {item.title}
                  </h3>
                  <div className='text-left text-sm'>{item.details}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductRoadmap;
