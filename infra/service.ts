import { hubRepositoryBucket } from './storage';

const vpc = new sst.aws.Vpc('MyVpc');
export const cluster = new sst.aws.Cluster('MyCluster', {
  vpc,
  transform: {
    // mutate the underlying aws.ecs.Cluster args
    cluster: (args) => {
      // enable CloudWatch Container Insights (enhanced)
      args.settings = [{ name: 'containerInsights', value: 'enhanced' }];
    }
  }
});

// env variables for the service
export const elasticSearchNodeSrvLss = new sst.Secret(
  'ELASTICSEARCH_NODE_LESS'
);
export const elasticSearchKeySrvLss = new sst.Secret(
  'ELASTICSEARCH_API_KEY_LESS'
);

const domainName =
  $app.stage === 'production'
    ? 'api.vbdhub.org'
    : `api-${$app.stage}.vbdhub.org`;

export const service = new sst.aws.Service('ServiceNestJS', {
  cluster,
  link: [elasticSearchNodeSrvLss, elasticSearchKeySrvLss, hubRepositoryBucket],
  environment: {
    NODE_ENV: $dev ? 'development' : 'production',
    PORT: '3001'
  },
  image: {
    context: '.', // do not change, the Dockerfile uses relative paths
    dockerfile: 'packages/service/Dockerfile'
  },
  capacity: {
    fargate: { base: 1, weight: 0 }, // 1st task on On-Demand Fargate
    spot: { weight: 1 } // all remaining tasks on Spot
  },
  scaling: {
    min: 1,
    max: 3,
    requestCount: 15,
    memoryUtilization: 70
  },
  loadBalancer: {
    domain: {
      name: domainName,
      dns: sst.cloudflare.dns({
        proxy: true
      })
    },
    ports: [
      { listen: '80/http', redirect: '443/https' }, // optional redirect
      { listen: '443/https', forward: '3001/http' }
    ],
    health: {
      // target group health check for 3001/http
      '3001/http': {
        path: '/health', // backend health route
        successCodes: '200-299',
        interval: '30 seconds',
        timeout: '5 seconds',
        healthyThreshold: 2,
        unhealthyThreshold: 2
      }
    }
  },
  dev: {
    command: 'npm run --workspace @vbdhub/service start:dev',
    url: 'http://localhost:3001/'
  }
});
