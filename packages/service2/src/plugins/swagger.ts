import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import basicAuth from '@fastify/basic-auth';

export default fp(async (fastify) => {
  // Register basic auth first
  await fastify.register(basicAuth, {
    validate: async (username, password) => {
      if (username !== 'admin' || password !== 'admin123') {
        return new Error('Unauthorised');
      }
    },
    authenticate: true
  });

  // Register swagger docs
  await fastify.register(swagger, {
    openapi: {
      info: { title: 'API', version: '1.0.0' }
    }
  });

  // Protect swagger-ui routes
  fastify.register(async function (instance) {
    instance.addHook('onRequest', instance.basicAuth); // Require basic auth
    await instance.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: { docExpansion: 'list' }
    });
  });
});
