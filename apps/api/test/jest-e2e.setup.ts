// Provides safe defaults for env validation (@erms/config) so e2e specs can
// import AppModule without requiring a live .env file. Real dependency
// connections are mocked per-test via overrideProvider.
process.env.NODE_ENV ??= 'test';
process.env.APP_ENV ??= 'local';
process.env.LOG_LEVEL ??= 'silent';
process.env.API_PORT ??= '4000';
process.env.DATABASE_URL ??=
  'postgresql://erms:erms_local_dev@localhost:5432/erms_test?schema=public';
process.env.REDIS_URL ??= 'redis://localhost:6379';
process.env.S3_ENDPOINT ??= 'http://localhost:9000';
process.env.S3_REGION ??= 'us-east-1';
process.env.S3_BUCKET ??= 'erms-test';
process.env.S3_ACCESS_KEY_ID ??= 'test';
process.env.S3_SECRET_ACCESS_KEY ??= 'test';
process.env.MAIL_HOST ??= 'localhost';
process.env.MAIL_PORT ??= '1025';
