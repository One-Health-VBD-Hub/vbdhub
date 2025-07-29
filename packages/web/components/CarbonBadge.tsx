import Link from 'next/link';
import { memo } from 'react';

const CarbonBadge = memo(
  ({
    co2,
    percentage,
    url
  }: {
    co2: number;
    percentage: number;
    url: string;
  }) => (
    <div className='flex flex-col items-center gap-2 md:flex-row'>
      <div className='codepen_wrapper'>
        <style>
          {`
          #wcb.carbonbadge {
            --b1: #0e11a8;
            --b2: #00ffbc;
            font-size: 15px;
            text-align: center;
            color: var(--b1);
            line-height: 1.15;
          }
          #wcb.carbonbadge sub {
            vertical-align: middle;
            position: relative;
            top: 0.3em;
            font-size: 0.7em;
          }
          #wcb #wcb_2,
          #wcb #wcb_a,
          #wcb #wcb_g {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            font-size: 1em;
            line-height: 1.15;
            // font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            text-decoration: none;
            // margin: 0.2em 0;
          }
          #wcb #wcb_a,
          #wcb #wcb_g {
            padding: 0.2em 0.3em;
            border: 0.13em solid var(--b2);
          }
          #wcb #wcb_g {
            border-radius: 0.3em 0 0 0.3em;
            background: #fff;
            border-right: 0;
            min-width: 8.2em;
          }
          #wcb #wcb_a {
            border-radius: 0 0.3em 0.3em 0;
            border-left: 0;
            background: var(--b1);
            color: #fff;
            font-weight: 700;
            border-color: var(--b1);
          }
          #wcb.wcb-d #wcb_a {
            color: var(--b1);
            background: var(--b2);
            border-color: var(--b2);
          }
          #wcb.wcb-d #wcb_2 {
            color: #fff;
          }
        `}
        </style>
        <div id='wcb' className='carbonbadge text-[#0e11a8]'>
          <div id='wcb_p'>
            <span id='wcb_g'>
              {co2}g of CO<sub>2</sub>/view
            </span>
            <Link
              id='wcb_a'
              target='_blank'
              rel='nofollow noopener'
              href={`https://www.websitecarbon.com/website/${url}`}
            >
              Website Carbon
            </Link>
          </div>
        </div>
      </div>
      <span>&nbsp;Cleaner than {percentage}% of pages tested</span>
    </div>
  )
);
CarbonBadge.displayName = 'CarbonBadge';
export default CarbonBadge;
