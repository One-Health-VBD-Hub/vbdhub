'use client';

import React, { useEffect, useState } from 'react';
import {
  Button,
  // ExpandableSearch,
  Header,
  HeaderGlobalBar,
  HeaderMenu,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderName,
  HeaderNavigation,
  HeaderSideNavItems,
  SideNav,
  SideNavItems,
  SkipToContent
} from '@carbon/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStytch, useStytchSession } from '@stytch/nextjs';
import { NewTab } from '@carbon/icons-react';
import Image from 'next/image';

export default function Layout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  // wake up server on mount
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}`, { method: 'HEAD' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Server not responding');
        }
      })
      .catch((error) => {
        console.error('Error connecting to server:', error);
      });
  }, []); // Empty dependency array ensures this runs only once on mount

  const [isSideNavExpanded, setIsSideNavExpanded] = useState(false);
  const path = usePathname();
  let lastComponent = path.split('/').filter(Boolean).pop();
  if (path.includes('blog')) lastComponent = 'blog';
  if (path.includes('learn')) lastComponent = 'learn';
  if (path.includes('dataset')) lastComponent = 'dataset';
  const page = lastComponent
    ? lastComponent.charAt(0).toUpperCase() + lastComponent.slice(1)
    : lastComponent;

  const { session } = useStytchSession();
  const stytch = useStytch();

  return (
    <>
      <div className='mb-[48px]'>
        <Header aria-label='Web application name'>
          <SkipToContent />
          <HeaderMenuButton
            aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
            onClick={() => setIsSideNavExpanded(!isSideNavExpanded)}
            isActive={isSideNavExpanded}
            aria-expanded={isSideNavExpanded}
          />
          <HeaderName
            isSideNavExpanded={false}
            className='min-w-[185px]'
            style={{ paddingRight: 0 }}
            as={Link}
            href='/'
            prefix=''
          >
            {/*<span>VBD&nbsp;</span>*/}
            {/*<Image*/}
            {/*  width={125}*/}
            {/*  height={144}*/}
            {/*  className='relative bottom-[1px] mr-[1px] h-6 w-auto'*/}
            {/*  src='logo-main.svg'*/}
            {/*  alt='logo of the One Health Vector-Borne Diseases Hub'*/}
            {/*/>*/}
            {/*<span>ub&nbsp;</span>*/}
            {/*<span className='font-normal'>-&nbsp;</span>*/}
            {/*{path !== '/' ? (*/}
            {/*  <span className='font-normal'>*/}
            {/*    {path.charAt(1).toUpperCase() + path.substring(2)}*/}
            {/*  </span> // TODO: make more robust*/}
            {/*) : (*/}
            {/*  <span className='font-normal'>Home</span>*/}
            {/*)}*/}
            {/* OR */}
            <Image
              width={125}
              height={144}
              className='mr-1.5 h-7 w-auto'
              src='/logo-teal.svg'
              alt='logo of the One Health Vector-Borne Diseases Hub'
            />
            <span className='font-normal'>VBD Hub -&nbsp;</span>
            {/* TODO: make more robust */}
            {path !== '/' ? page : 'Home'}
          </HeaderName>
          <HeaderNavigation aria-label='Vector-Borne Diseases Hub'>
            <HeaderMenuItem href='/' as={Link} isActive={path === '/'}>
              Home
            </HeaderMenuItem>
            <HeaderMenuItem
              href='/search'
              as={Link}
              isActive={path === '/search'}
            >
              Find Data
            </HeaderMenuItem>
            <HeaderMenuItem
              href='/about'
              as={Link}
              isActive={path === '/about'}
            >
              About
            </HeaderMenuItem>
            <HeaderMenu aria-label='Resources' menuLinkName='Resources'>
              <HeaderMenuItem
                href='/resources/package'
                as={Link}
                isActive={path === '/resources/package'}
              >
                <span className='font-medium'>R</span> package
              </HeaderMenuItem>
              <HeaderMenuItem
                href='/resources/fair'
                as={Link}
                isActive={path === '/resources/fair'}
              >
                FAIR data
              </HeaderMenuItem>
              <HeaderMenuItem
                href='/resources/share'
                as={Link}
                isActive={path === '/resources/share'}
              >
                How to share?
              </HeaderMenuItem>
              <HeaderMenuItem
                href='/resources/learn'
                as={Link}
                isActive={path === '/resources/learn'}
              >
                Learn
              </HeaderMenuItem>
            </HeaderMenu>
            <HeaderMenu aria-label='Community' menuLinkName='Community'>
              <HeaderMenuItem
                href='https://forum.vbdhub.org'
                as={Link}
                target='_blank'
              >
                <span className='flex items-baseline gap-1'>
                  Forum{' '}
                  <span className='flex items-center text-xs'>
                    (opens in new tab&nbsp;
                    <NewTab size={10} />)
                  </span>
                </span>
              </HeaderMenuItem>
              <HeaderMenuItem
                href='/blog'
                as={Link}
                isActive={path === '/blog'}
              >
                Blog
              </HeaderMenuItem>
            </HeaderMenu>
          </HeaderNavigation>
          <HeaderGlobalBar>
            {/*{path !== '/search' && (*/}
            {/*  <ExpandableSearch*/}
            {/*    style={{ outline: 'none !imporant' }}*/}
            {/*    className='max-w-[400px] ring-0'*/}
            {/*    size='lg'*/}
            {/*    labelText='Search'*/}
            {/*    closeButtonLabelText='Clear search input'*/}
            {/*    id='search-expandable-1'*/}
            {/*  />*/}
            {/*)}*/}
            {path !== '/auth' &&
              (session ? (
                <Button
                  href='/'
                  kind='ghost'
                  as={Link}
                  onClick={() => stytch.session.revoke()}
                >
                  Sign out
                </Button>
              ) : (
                <Button href='/auth' kind='ghost' as={Link}>
                  Sign in
                </Button>
              ))}
          </HeaderGlobalBar>
          <SideNav
            suppressHydrationWarning
            aria-label='Side navigation'
            expanded={isSideNavExpanded}
            isPersistent={false}
            onSideNavBlur={() => setIsSideNavExpanded(false)}
          >
            <SideNavItems>
              <HeaderSideNavItems>
                <HeaderMenuItem href='/' as={Link} isActive={path === '/'}>
                  Home
                </HeaderMenuItem>
                <HeaderMenuItem
                  href='/search'
                  as={Link}
                  isActive={path === '/search'}
                >
                  Find Data
                </HeaderMenuItem>
                <HeaderMenuItem
                  href='/about'
                  as={Link}
                  isActive={path === '/about'}
                >
                  About
                </HeaderMenuItem>
                <HeaderMenu aria-label='Resources' menuLinkName='Resources'>
                  <HeaderMenuItem
                    href='/resources/package'
                    as={Link}
                    isActive={path === '/resources/package'}
                  >
                    <span className='font-medium'>R</span> package
                  </HeaderMenuItem>
                  <HeaderMenuItem
                    href='/resources/fair'
                    as={Link}
                    isActive={path === '/resources/fair'}
                  >
                    FAIR data
                  </HeaderMenuItem>
                  <HeaderMenuItem
                    href='/resources/share'
                    as={Link}
                    isActive={path === '/resources/share'}
                  >
                    How to share?
                  </HeaderMenuItem>
                  <HeaderMenuItem
                    href='/resources/learn'
                    as={Link}
                    isActive={path === '/resources/learn'}
                  >
                    Learn
                  </HeaderMenuItem>
                </HeaderMenu>
                <HeaderMenu aria-label='Community' menuLinkName='Community'>
                  <HeaderMenuItem
                    href='https://forum.vbdhub.org'
                    as={Link}
                    target='_blank'
                  >
                    <span className='flex items-baseline gap-1'>
                      Forum{' '}
                      <span className='flex items-center text-[10px]'>
                        (opens in new tab&nbsp;
                        <NewTab size={10} />)
                      </span>
                    </span>
                  </HeaderMenuItem>
                  <HeaderMenuItem
                    href='/blog'
                    as={Link}
                    isActive={path === '/blog'}
                  >
                    Blog
                  </HeaderMenuItem>
                </HeaderMenu>
              </HeaderSideNavItems>
            </SideNavItems>
          </SideNav>
        </Header>
      </div>
      {children}
    </>
  );
}
