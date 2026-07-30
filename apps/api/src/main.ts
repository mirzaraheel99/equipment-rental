import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app/app.module.js';
import { PinoNestLogger } from './common/logger/pino-nest-logger.js';
import { getEnv } from './config/configuration.js';

const API_PREFIX = 'api/v1';

async function bootstrap() {
  const env = getEnv();
  const logger = PinoNestLogger.create('erms-api', env.APP_ENV, env.LOG_LEVEL);

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
    bufferLogs: true,
  });

  app.setGlobalPrefix(API_PREFIX);

  app.use(
    helmet({
      ...(env.APP_ENV === 'production' ? {} : { contentSecurityPolicy: false as const }),
    }),
  );

  app.enableCors({
    origin: env.APP_ENV === 'production' ? false : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableShutdownHooks();

  if (env.APP_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('ERMS API')
      .setDescription('Equipment Rental Management System — API')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${API_PREFIX}/docs`, app, document);
  }

  await app.listen(env.API_PORT);
  logger.log(`ERMS API listening on port ${env.API_PORT} (${env.APP_ENV})`, 'Bootstrap');
}

void bootstrap();
