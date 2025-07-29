import React from 'react';

interface ScheduleProps {
  schedule: {
    time: string;
    event: string | React.ReactNode;
  }[];
}

const Schedule = ({ schedule }: ScheduleProps) => {
  return (
    <div className='mx-auto'>
      <ul className='divide-y divide-gray-100'>
        {schedule.map((item, index) => (
          <li key={index} className='flex gap-4 py-2 sm:gap-5'>
            <span className='text-blue-600'>{item.time}</span>
            <span className='text-gray-700'>{item.event}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Schedule;
