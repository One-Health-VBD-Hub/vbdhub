import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';

const root: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify,
  opts
): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    return { root: true };
  });
};

export default root;
