import { Input } from '../.sst/platform/src/components/input';
import { cluster, elasticSearchKey, elasticSearchNode } from './service';

// define tasks
// trigger with `npx sst shell tsx packages/scripts/src/tasks`
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
    devCommand: `${process.execPath} -r ts-node/register src/jobs/sync.ts vt 10 data`,
    schedule: 'cron(0 2 ? * SUN *)' // every Sunday at 02:00 UTC
  },
  {
    name: 'SyncVt',
    DB: 'vt',
    CONCURRENCY: '10',
    devCommand: `${process.execPath} -r ts-node/register src/jobs/sync.ts vt 10`,
    schedule: 'cron(0 4 ? * SUN *)' // every Sunday at 04:00 UTC
  },
  {
    name: 'SyncVdData',
    DB: 'vd',
    CONCURRENCY: '10', // ignored
    MODE: 'data',
    devCommand: `${process.execPath} -r ts-node/register src/jobs/sync.ts vd 10 data`,
    schedule: 'cron(0 2 ? * SAT *)' // every Saturday at 02:00 UTC
  },
  {
    name: 'SyncVd',
    DB: 'vd',
    CONCURRENCY: '10', // ignored
    devCommand: `${process.execPath} -r ts-node/register src/jobs/sync.ts vd 10`,
    schedule: 'cron(0 4 ? * SAT *)' // every Saturday at 04:00 UTC
  },
  {
    name: 'SyncPx',
    DB: 'px',
    CONCURRENCY: '20',
    devCommand: `${process.execPath} -r ts-node/register src/jobs/sync.ts px 20`,
    schedule: 'cron(0 2 ? * MON *)' // every Monday at 02:00 UTC
  },
  {
    name: 'SyncGbif',
    DB: 'gbif',
    CONCURRENCY: '10',
    devCommand: `${process.execPath} -r ts-node/register src/jobs/sync.ts gbif 10`,
    schedule: 'cron(0 2 ? * FRI *)' // every Friday at 02:00 UTC
  }
];

// create a task for each spec
for (const taskSpec of taskSpecs) {
  const task = new sst.aws.Task(taskSpec.name, {
    cluster,
    image: {
      context: '.', // do not change, the Dockerfile uses relative paths
      dockerfile: 'packages/service/src/jobs/Dockerfile'
    },
    cpu: '0.5 vCPU',
    memory: '1 GB',
    environment: {
      ELASTICSEARCH_NODE: elasticSearchNode.value,
      ELASTICSEARCH_API_KEY: elasticSearchKey.value,
      NODE_ENV: 'production',
      DB: taskSpec.DB,
      CONCURRENCY: taskSpec.CONCURRENCY,
      MODE: taskSpec.MODE ?? ''
    },
    dev: {
      directory: 'packages/service',
      command: taskSpec.devCommand
    },
    link: [elasticSearchNode, elasticSearchKey]
  });

  // schedule the task to run weekly
  new sst.aws.Cron(`${taskSpec.name}Job`, {
    task: task,
    schedule: taskSpec.schedule,
    enabled: $app.stage === 'production' // only in production
  });
}
