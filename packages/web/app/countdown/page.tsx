import type { Metadata } from 'next';
import { connection } from 'next/server';

export const metadata: Metadata = {
  title: 'Countdown',
  alternates: { canonical: '/countdown' },
  robots: {
    index: false,
    follow: false
  }
};

const targetDate = new Date(Date.UTC(2027, 4, 31));
const londonDateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric'
});

const nonWorkingDays = new Set([
  // England and Wales bank holidays: https://www.gov.uk/bank-holidays
  Date.UTC(2026, 7, 31),
  Date.UTC(2026, 11, 25),
  Date.UTC(2026, 11, 28),
  Date.UTC(2027, 0, 1),
  Date.UTC(2027, 2, 26),
  Date.UTC(2027, 2, 29),
  Date.UTC(2027, 4, 3),
  targetDate.getTime(),
  // Imperial closure days: https://www.imperial.ac.uk/human-resources/leave/university-closure-days/
  Date.UTC(2026, 11, 23),
  Date.UTC(2026, 11, 24),
  Date.UTC(2026, 11, 29),
  Date.UTC(2026, 11, 30),
  Date.UTC(2026, 11, 31),
  Date.UTC(2027, 2, 25),
  Date.UTC(2027, 2, 30),
  Date.UTC(2027, 2, 31)
]);

function getTodayInLondon() {
  const parts = Object.fromEntries(
    londonDateFormatter.formatToParts(new Date()).map(({ type, value }) => [type, value])
  );

  // Use UTC midnight from here so daylight-saving changes cannot affect the arithmetic.
  return new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
}

function getWorkingDaysUntilTarget(date: Date) {
  let workingDays = 0;

  while (date < targetDate) {
    date.setUTCDate(date.getUTCDate() + 1);

    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6 && !nonWorkingDays.has(date.getTime())) {
      workingDays++;
    }
  }

  return workingDays;
}

function getCalendarTimeUntilTarget(date: Date) {
  if (date >= targetDate) return { months: 0, days: 0 };

  const months =
    (targetDate.getUTCFullYear() - date.getUTCFullYear()) * 12 +
    targetDate.getUTCMonth() -
    date.getUTCMonth() -
    (targetDate.getUTCDate() < date.getUTCDate() ? 1 : 0);
  const afterFullMonths = new Date(date);
  afterFullMonths.setUTCMonth(afterFullMonths.getUTCMonth() + months);

  return {
    months,
    days: Math.round((targetDate.getTime() - afterFullMonths.getTime()) / 86_400_000)
  };
}

export default async function CountdownPage() {
  // Wait for a request so the countdown uses the current date rather than the build date.
  await connection();

  const today = getTodayInLondon();

  const workingDays = getWorkingDaysUntilTarget(new Date(today));
  const weeks = Math.floor(workingDays / 5);
  const days = workingDays % 5;
  const calendarTime = getCalendarTimeUntilTarget(today);

  return (
    <main
      className='fixed inset-0 z-10 overflow-y-auto bg-white px-6 text-[#161616]'
      aria-label='Working-day countdown to 31 May 2027, excluding weekends, England and Wales bank holidays, and Imperial College London closure days'
    >
      <div className='mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center py-12 text-center'>
        <p className='text-5xl font-light tracking-tight sm:text-7xl'>
          {calendarTime.months} {calendarTime.months === 1 ? 'month' : 'months'},{' '}
          {calendarTime.days} {calendarTime.days === 1 ? 'day' : 'days'}
        </p>
        <p className='mt-6 text-2xl font-light sm:text-4xl'>
          {weeks} working {weeks === 1 ? 'week' : 'weeks'}, {days} {days === 1 ? 'day' : 'days'}
        </p>
        <p className='mt-4 text-lg font-light sm:text-2xl'>
          {workingDays} working {workingDays === 1 ? 'day' : 'days'} total
        </p>

        <ol className='mt-12 max-w-xl list-decimal space-y-2 pl-5 text-left text-sm leading-6 text-[#525252]'>
          <li>Months and days are the calendar time remaining until 31 May 2027.</li>
          <li>A working week is five working days.</li>
          <li>
            Working days exclude weekends,{' '}
            <a className='underline' href='https://www.gov.uk/bank-holidays'>
              England and Wales bank holidays
            </a>{' '}
            and{' '}
            <a
              className='underline'
              href='https://www.imperial.ac.uk/human-resources/leave/university-closure-days/'
            >
              Imperial College London closure days
            </a>
            .
          </li>
        </ol>
      </div>
    </main>
  );
}
