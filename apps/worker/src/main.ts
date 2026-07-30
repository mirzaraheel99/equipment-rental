import { createServer, type Server } from 'node:http';

import { createLogger } from '@erms/observability';
import { Redis } from 'ioredis';

import { env } from './config.js';
import { JobRegistry } from './job-registry.js';
import { createSampleHeartbeatJob } from './jobs/sample-heartbeat.job.js';

const logger = createLogger({
  appName: 'erms-worker',
  environment: env.APP_ENV,
  level: env.LOG_LEVEL,
});
const redis = new Redis(env.REDIS_URL, { lazyConnect: false, maxRetriesPerRequest: 1 });

const registry = new JobRegistry();
registry.register(createSampleHeartbeatJob(logger));

let tick = 0;
let heartbeatTimer: NodeJS.Timeout | undefined;
let healthServer: Server | undefined;

function main() {
  redis.on('error', (error) => logger.error({ error }, 'Redis connection error'));
  redis.on('connect', () => logger.info('Connected to Redis'));

  healthServer = createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', registeredJobs: registry.list() }));
      return;
    }
    res.writeHead(404);
    res.end();
  });
  healthServer.listen(env.WORKER_PORT, () => {
    logger.info(`Worker health signal listening on port ${env.WORKER_PORT}`);
  });

  heartbeatTimer = setInterval(() => {
    tick += 1;
    const job = registry.get('sample.heartbeat');
    void job?.handler({ tick }, { correlationId: crypto.randomUUID() });
  }, 30_000);

  logger.info({ registeredJobs: registry.list() }, 'ERMS worker started');
}

async function shutdown(signal: string) {
  logger.info({ signal }, 'Worker shutting down');
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  healthServer?.close();
  await redis.quit();
  process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

main();
