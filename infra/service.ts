const vpc = new sst.aws.Vpc('MyVpc');
const cluster = new sst.aws.Cluster('MyCluster', { vpc });

// env variables for the service
const elasticSearchNode = new sst.Secret('ELASTICSEARCH_NODE');
const elasticSearchKey = new sst.Secret('ELASTICSEARCH_API_KEY');

const domainName =
  $app.stage === 'production'
    ? 'api.vbdhub.org'
    : `api-${$app.stage}.vbdhub.org`;

export const service = new sst.aws.Service('Service', {
  cluster,
  environment: {
    ELASTICSEARCH_NODE: elasticSearchNode.value,
    ELASTICSEARCH_API_KEY: elasticSearchKey.value,
    NODE_ENV: $app.stage === 'production' ? 'production' : 'development',
    PORT: '3001'
  },
  image: {
    context: '.',
    dockerfile: 'packages/service/Dockerfile'
  },
  // Use 50% regular Fargate and 50% Fargate Spot. And ensure that the first task uses Fargate Spot
  capacity: {
    fargate: { weight: 1 },
    spot: { weight: 1, base: 1 }
  },
  scaling: {
    min: 1,
    max: 3,
    cpuUtilization: 70,
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
    ]
  },
  dev: {
    command: 'npm run --workspace @vbdhub/service start:dev',
    url: 'http://localhost:3001/'
  },
  link: [elasticSearchNode, elasticSearchKey]
});
