import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Blog - Community - Vector-Borne Diseases Hub',
  description:
    'Read the latest news and updates from the Vector-Borne Diseases Hub.',
  openGraph: {
    title: 'Blog - Community - Vector-Borne Diseases Hub',
    description:
      'Read the latest news and updates from the Vector-Borne Diseases Hub.'
  },
  alternates: {
    canonical: '/blog'
  }
};

const posts = [
  {
    id: 1,
    title: 'Citizen science contributions to vector surveillance',
    href: '/blog/citizen-science',
    description: (
      <>
        Citizen science is enhancing vector surveillance and contributing to the
        Vector-Borne Diseases Hub. Learn about the importance of community
        involvement in VBD research.
      </>
    ),
    date: 'Jul 15, 2025',
    datetime: '2024-07-15',
    category: { title: 'Science', href: '#' },
    author: {
      name: 'Robert T. Jones',
      role: 'Principal Investigator',
      href: 'https://www.linkedin.com/in/jonesrt/',
      imageUrl: '/members/robert.webp',
      imageWidth: 491,
      imageHeight: 550
    }
  },
  {
    id: 2,
    title: 'Training workshop on data sharing and analysis',
    href: '/blog/training-2025',
    description: (
      <>
        <span className='font-medium'>
          <time dateTime='2025-06-04'>
            June 4<span className='align-super text-xs'>th</span>
          </time>{' '}
          to{' '}
          <time dateTime='2025-06-06'>
            6<span className='align-super text-xs'>th</span> 2025
          </time>
        </span>
        , come to the VBD Hub for a free training workshop on data sharing and
        analysis at leafy Silwood Park! More details in the blog post! 🦟💻
      </>
    ),
    date: 'Mar 28, 2025',
    datetime: '2025-03-28',
    category: { title: 'Training', href: '#' },
    author: {
      name: 'Lauren Cator',
      role: 'Principal Investigator',
      href: 'https://www.linkedin.com/in/lauren-cator-28a36774/',
      imageUrl: '/members/lauren.webp',
      imageWidth: 800,
      imageHeight: 800
    }
  },
  {
    id: 3,
    title: 'Vector-Borne Diseases Hub launch',
    href: '/blog/initial-announcement',
    description: (
      <>
        The Vector-Borne Diseases Hub is now live! This platform aims to
        facilitate data sharing and collaboration in VBD research. Read more
        about our mission.
      </>
    ),
    date: 'Aug 17, 2024',
    datetime: '2024-08-14',
    category: { title: 'Announcements', href: '#' },
    author: {
      name: 'VBD Hub',
      role: 'Team',
      imageUrl: '/bordered-logo.webp',
      imageWidth: 491,
      imageHeight: 550
    }
  }
  // {
  //   id: 4,
  //   title: 'Does Vitamin B12 prevent mosquito bites?',
  //   href: '/blog/vitamin-b12-mosquitoes',
  //   description: (
  //     <>
  //       A post that investigates the common belief that taking Vitamin B12
  //       supplements can prevent mosquito bites. Read to learn more about the
  //       research and implications for vector-borne disease control.
  //     </>
  //   ),
  //   date: 'Jun 17, 2025',
  //   datetime: '2025-06-17',
  //   category: { title: 'Popular science', href: '#' },
  //   author: {
  //     name: 'VBD Hub',
  //     role: 'Team',
  //     imageUrl: '/bordered-logo.webp',
  //     imageWidth: 491,
  //     imageHeight: 550
  //   }
  // }
  // More posts...
];

export default function Blog() {
  return (
    <main id='main-content' className='mx-auto mt-24 sm:mt-32'>
      <div className='bg-white pb-24 sm:pb-32'>
        <div className='mx-auto max-w-7xl'>
          <div className='mx-auto max-w-2xl lg:mx-0'>
            <h1 className='text-4xl font-semibold tracking-tight text-pretty sm:text-5xl'>
              From the blog
            </h1>
            <p className='mt-2 text-lg/8 text-gray-700'>
              Learn more about the hub platform, vector borne diseases and
              working with data related to them.
            </p>
          </div>
          <div className='mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3'>
            {posts.map((post) => (
              <article
                key={post.id}
                className='flex max-w-xl flex-col items-start justify-between'
                title={post.title}
              >
                <div className='flex items-center gap-x-4 text-xs'>
                  <time dateTime={post.datetime} className='text-gray-500'>
                    {post.date}
                  </time>
                  <Link
                    href={post.category.href}
                    className='relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-100'
                  >
                    {post.category.title}
                  </Link>
                </div>
                <div className='group relative'>
                  <h3 className='mt-3 text-lg/6 font-semibold group-hover:text-gray-700'>
                    <Link href={post.href}>
                      <span className='absolute inset-0' />
                      {post.title}
                    </Link>
                  </h3>
                  <p className='mt-5 line-clamp-3 text-sm/6 text-gray-700'>
                    {post.description}
                  </p>
                </div>
                <div className='relative mt-8 flex items-center gap-x-4'>
                  <Image
                    src={post.author.imageUrl}
                    alt={`${post.author.name}'s profile picture`}
                    width={post.author.imageWidth}
                    height={post.author.imageHeight}
                    className='size-10 rounded-full bg-gray-50 object-cover'
                  />
                  <div className='text-sm/6'>
                    <p className='font-semibold'>
                      {post.author.href ? (
                        <Link href={post.author.href} target='_blank'>
                          <span className='absolute inset-0' />
                          {post.author.name}
                        </Link>
                      ) : (
                        post.author.name
                      )}
                    </p>
                    <p className='text-gray-700'>{post.author.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
