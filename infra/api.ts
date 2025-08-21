import { bucket } from './storage';

export const api = new sst.aws.ApiGatewayV2('Api', {
  cors: true,
  link: [bucket]
});

api.route('GET /test', 'packages/functions/src/test.handler');
api.route('GET /search', 'packages/functions/src/search.handler');
