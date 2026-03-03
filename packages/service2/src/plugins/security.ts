import fp from 'fastify-plugin';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import underPressure from '@fastify/under-pressure';
import cors from '@fastify/cors';

export default fp(async (fastify) => {
  await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type']
  });
  await fastify.register(helmet, { global: true }); // per-route override via route opts
  await fastify.register(rateLimit, {
    max: 300,
    timeWindow: '1 minute'
  });
  await fastify.register(underPressure, {
    maxEventLoopUtilization: 0.98,
    exposeStatusRoute: '/status' // health & pressure
  });
});
