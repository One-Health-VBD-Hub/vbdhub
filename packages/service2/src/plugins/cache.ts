import fp from 'fastify-plugin';
import Keyv from 'keyv';

export interface CachePluginOptions {
  namespace?: string;
  ttl?: number;
}

export default fp<CachePluginOptions>(
  async (fastify, options) => {
    const keyv = new Keyv({
      namespace: options.namespace ?? 'service',
      ttl: options.ttl
    });

    fastify.decorate('cache', keyv);

    fastify.addHook('onClose', async () => {
      await keyv.disconnect();
    });
  },
  { name: 'cache' }
);

declare module 'fastify' {
  interface FastifyInstance {
    cache: Keyv;
  }
}
