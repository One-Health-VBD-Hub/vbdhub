import { Input } from '../.sst/platform/src/components/input';
import {
  cluster,
  elasticSearchKeySrvLss,
  elasticSearchNodeSrvLss
} from './service';

// define tasks
// trigger with `sst shell tsx packages/scripts/src/tasks`
// or just `sst shell -- ts-node packages/service/src/jobs/sync gbif 10`
const taskSpecs: {
  name: string;
  DB: string;
  CONCURRENCY: string;
  MODE?: string;
  devCommand: string;
  schedule: Input<`rate(${string})` | `cron(${string})`>;
}[] = [
  {
    name: 'SyncVtData',
    DB: 'vt',
    CONCURRENCY: '10', // ignored
    MODE: 'data',
    devCommand: `${process.execPath} -r ts-node/register src/jobs/sync vt 10 data`,
    // schedule: 'cron(0 2 ? * SUN *)' // every Sunday at 02:00 UTC
    schedule: 'cron(0 20 ? * MON *)' // every MON at 20:00 UTC
  },
  {
    name: 'SyncVt',
    DB: 'vt',
    CONCURRENCY: '10',
    devCommand: `${process.execPath} -r ts-node/register src/jobs/sync vt 10`,
    // schedule: 'cron(0 4 ? * SUN *)' // every Sunday at 04:00 UTC
    schedule: 'cron(0 23 ? * MON *)' // every MON at 23:00 UTC
  },
  {
    name: 'SyncVdData',
    DB: 'vd',
    CONCURRENCY: '10', // ignored
    MODE: 'data',
    devCommand: `${process.execPath} -r ts-node/register src/jobs/sync vd 10 data`,
    // schedule: 'cron(0 2 ? * SAT *)' // every Saturday at 02:00 UTC
    schedule: 'cron(0 2 ? * TUE *)' // every TUE at 02:00 UTC
  },
  {
    name: 'SyncVd',
    DB: 'vd',
    CONCURRENCY: '10', // ignored
    devCommand: `${process.execPath} -r ts-node/register src/jobs/sync vd 10`,
    // schedule: 'cron(0 4 ? * SAT *)' // every Saturday at 04:00 UTC
    schedule: 'cron(0 5 ? * TUE *)' // every TUE at 05:00 UTC
  },
  {
    name: 'SyncPx',
    DB: 'px',
    CONCURRENCY: '20',
    devCommand: `${process.execPath} -r ts-node/register src/jobs/sync px 20`,
    // schedule: 'cron(0 2 ? * MON *)' // every Monday at 02:00 UTC
    schedule: 'cron(0 8 ? * TUE *)' // every TUE at 08:00 UTC
  },
  {
    name: 'SyncGbif',
    DB: 'gbif',
    CONCURRENCY: '10',
    devCommand: `${process.execPath} -r ts-node/register src/jobs/sync gbif 10`,
    // schedule: 'cron(0 2 ? * FRI *)' // every Friday at 02:00 UTC
    schedule: 'cron(0 10 ? * TUE *)' // every TUE at 10:00 UTC
  }
];

// create a task for each spec
for (const taskSpec of taskSpecs) {
  const task = new sst.aws.Task(taskSpec.name, {
    cluster,
    image: {
      context: '.', // do not change, the Dockerfile uses relative paths
      dockerfile: 'packages/service/src/jobs/Dockerfile'
    } as const,
    cpu: '0.5 vCPU',
    memory: '1 GB',
    link: [elasticSearchNodeSrvLss, elasticSearchKeySrvLss],
    environment: {
      NODE_ENV: $dev ? 'development' : 'production',
      DB: taskSpec.DB,
      CONCURRENCY: taskSpec.CONCURRENCY,
      MODE: taskSpec.MODE ?? ''
    },
    dev: {
      directory: 'packages/service',
      command: taskSpec.devCommand
    }
  });

  // schedule the task to run weekly
  new sst.aws.Cron(`${taskSpec.name}Job`, {
    task: task,
    schedule: taskSpec.schedule,
    // enabled: $app.stage === 'production' // only in production
  });
}
