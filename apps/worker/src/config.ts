import { loadConfig, workerEnvSchema } from '@erms/config';

export const env = loadConfig('worker', workerEnvSchema);
