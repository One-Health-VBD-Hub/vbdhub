import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import basicAuth from '@fastify/basic-auth';

export default fp(async (fastify) => {
  await fastify.register(basicAuth, {
    validate: async (username, password) => {
      if (username !== 'admin' || password !== 'admin123') {
        return new Error('Unauthorised');
      }
    },
    authenticate: true
  });

  await fastify.register(swagger, {
    openapi: {
      info: { title: 'API', version: '1.0.0' }
    }
  });

  fastify.register(async function (instance) {
    instance.addHook('onRequest', instance.basicAuth);
    await instance.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: { docExpansion: 'list' }
    });
  });
});
