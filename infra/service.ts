const vpc = new sst.aws.Vpc('MyVpc');
const cluster = new sst.aws.Cluster('MyCluster', { vpc });

// env variables for the service
const elasticSearchNode = new sst.Secret('ELASTICSEARCH_NODE');
const elasticSearchKey = new sst.Secret('ELASTICSEARCH_API_KEY');

const stage = $app.stage;

export const service = new sst.aws.Service('MyService', {
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
  loadBalancer: {
    domain: {
      name:
        $app.stage === 'production'
          ? 'api.vbdhub.org'
          : `api-${stage}.vbdhub.org`,
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
