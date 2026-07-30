import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { REDIS_CLIENT } from '../src/redis/redis.module.js';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      })
      .overrideProvider(REDIS_CLIENT)
      .useValue({ ping: jest.fn().mockResolvedValue('PONG') })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health returns 200 with a success envelope', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
    expect(response.headers['x-correlation-id']).toBeDefined();
  });

  it('GET /api/v1/health/ready returns 200 when dependencies are up', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health/ready').expect(200);

    expect(response.body.data.status).toBe('ok');
  });
});
