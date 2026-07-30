import { HealthService } from './health.service.js';

describe('HealthService', () => {
  it('reports liveness with a non-negative uptime', () => {
    const service = new HealthService(
      { $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) } as never,
      { ping: jest.fn().mockResolvedValue('PONG') } as never,
    );

    const result = service.getLiveness();

    expect(result.status).toBe('ok');
    expect(result.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });

  it('reports readiness as degraded when a dependency check fails', async () => {
    const service = new HealthService(
      { $queryRaw: jest.fn().mockRejectedValue(new Error('connection refused')) } as never,
      { ping: jest.fn().mockResolvedValue('PONG') } as never,
    );

    const result = await service.getReadiness();

    expect(result.status).toBe('degraded');
    expect(result.dependencies.database.status).toBe('down');
    expect(result.dependencies.redis.status).toBe('up');
  });

  it('reports readiness as ok when all dependencies are reachable', async () => {
    const service = new HealthService(
      { $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) } as never,
      { ping: jest.fn().mockResolvedValue('PONG') } as never,
    );

    const result = await service.getReadiness();

    expect(result.status).toBe('ok');
  });
});
