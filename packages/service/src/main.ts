// IMPORTANT: Make sure to import `instrument.ts` at the top of your file.
import './instrument';
// All other imports below
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';
import helmet from '@fastify/helmet';
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(), // using Fastify instead of default Express.js
    {
      logger:
        process.env.NODE_ENV !== 'development'
          ? new ConsoleLogger({ json: true }) // necessary for production logging
          : undefined
    }
  );

  // add helmet.js to secure the app by setting various HTTP headers
  await app.register(helmet);

  // get the ConfigService instance that loads the .env file
  const configService = app.get(ConfigService);

  const mode = configService.get<string>('NODE_ENV');
  Logger.warn(`Running in ${mode} mode`, 'bootstrap');

  // configure global validation
  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: mode === 'development',
      whitelist: true, // strip away non-whitelisted properties (extra properties not defined in the DTO)
      forbidNonWhitelisted: true, // throw an error if a non-whitelisted property is present in the request
      transform: true // automatically convert incoming string objects into instances of the corresponding DTO classes
    })
  );

  app.enableCors(); // enable CORS

  // set up Swagger for API documentation
  const config = new DocumentBuilder()
    .setTitle('Vector-Borne Diseases Hub (vbdhub.org) API')
    .setDescription('Auto-generated Swagger docs')
    .setVersion('1.0')
    .setContact('VBD Hub team', 'https://vbdhub.org', 'support@vbdhub.org')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document);

  const port = configService.get<number>('APP_PORT', 3001); // default to 3001 if APP_PORT is not defined;
  await app.listen(port, '0.0.0.0'); // 0.0.0.0 necessary for Fastify to work on all network interfaces
  Logger.log(`Application is running on: ${await app.getUrl()}`, 'bootstrap');
}

void bootstrap();
