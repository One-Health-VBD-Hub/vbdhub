import Stack from '@/components/Stack';

export const training2025Schedule = {
  day1: [
    {
      time: '09:30',
      event:
        'Welcome and Overview: Informatics for Vector Borne Disease Responses'
    },
    {
      time: '10:00',
      event:
        'Introduction of the Hub and Data Wrangling (where you can get data)'
    },
    { time: '11:00', event: 'Break' },
    { time: '11:15', event: 'Tutorial: Data wrangling and visualizing data' },
    { time: '12:00', event: 'Lunch' },
    { time: '13:00', event: 'Tick Drag Activity' },
    { time: '15:00', event: 'Break' },
    { time: '15:30', event: 'Continue: Data wrangling and visualising data' }
  ],
  day2: [
    { time: '09:00', event: 'Linear vs Nonlinear Models' },
    { time: '10:30', event: 'Break' },
    { time: '10:50', event: 'Introduction to time series' },
    { time: '12:00', event: 'Lunch' },
    {
      time: '13:00',
      event: (
        <Stack gap={2}>
          <p>
            <em>Track 1</em>: Time series (classical models, decomposition,
            lags, autoregressive/Arima models)
          </p>
          <p>
            <em>Track 2</em>: Modelling vector distributions through time and
            space (forecast modelling frameworks, GBIF & biomod2, spatial &
            temporal trends)
          </p>
        </Stack>
      )
    },
    { time: '16:30', event: 'Choosing capstone projects' }
  ],
  day3: [
    { time: '09:00', event: 'Capstone: Work on analysis' },
    { time: '10:30', event: 'Break' },
    { time: '11:00', event: 'Continue: Work on analysis' },
    { time: '12:00', event: 'Lunch' },
    { time: '13:00', event: 'Continue: Work on analysis' },
    { time: '15:00', event: 'Break' },
    { time: '15:30', event: 'Presentations' },
    { time: '16:30', event: 'Discussion & Wrap-up' }
  ]
};
