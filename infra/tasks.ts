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
  memory?: `${number} GB`;
  cpu?:
    | '1 vCPU'
    | '0.5 vCPU'
    | '0.25 vCPU'
    | '2 vCPU'
    | '4 vCPU'
    | '8 vCPU'
    | '16 vCPU';
}[] = [
  {
    name: 'SyncVt',
    DB: 'vt',
    CONCURRENCY: '10',
    devCommand: `${process.execPath} -r ts-node/register src/jobs/sync vt 10`,
    schedule: 'cron(0 4 ? * SUN *)' // every Sunday at 04:00 UTC
  },
  {
    name: 'SyncVd',
    DB: 'vd',
    CONCURRENCY: '10', // ignored
    devCommand: `${process.execPath} -r ts-node/register src/jobs/sync vd 10`,
    schedule: 'cron(0 4 ? * SAT *)' // every Saturday at 04:00 UTC
  },
  {
    name: 'SyncPx',
    DB: 'px',
    CONCURRENCY: '20',
    devCommand: `${process.execPath} -r ts-node/register src/jobs/sync px 15`,
    schedule: 'cron(0 2 ? * MON *)' // every Monday at 02:00 UTC
  },
  {
    name: 'SyncGbif',
    DB: 'gbif',
    CONCURRENCY: '10',
    devCommand: `${process.execPath} -r ts-node/register src/jobs/sync gbif 10`,
    schedule: 'cron(0 2 ? * FRI *)' // every Friday at 02:00 UTC
  },
  {
    name: 'SyncVbdhub',
    DB: 'hub',
    CONCURRENCY: '10',
    devCommand: `${process.execPath} -r ts-node/register src/jobs/sync hub 10`,
    schedule: 'cron(0 2 ? * SUN *)' // every Sunday at 02:00 UTC
  }
];

// create a task for each spec
for (const taskSpec of taskSpecs) {
  const task = new sst.aws.Task(taskSpec.name, {
    cluster,
    logging: { retention: '2 weeks' },
    image: {
      context: '.', // do not change, the Dockerfile uses relative paths
      dockerfile: 'packages/service/src/jobs/Dockerfile'
    } as const,
    cpu: taskSpec.cpu ?? '0.5 vCPU',
    memory: taskSpec.memory ?? '1 GB',
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
    enabled: $app.stage === 'production' // only in production
  });
}
