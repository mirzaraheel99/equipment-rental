import { Global, Module } from '@nestjs/common';

import { APP_ENV } from './app-env.token.js';
import { getEnv } from './configuration.js';

export { APP_ENV };

@Global()
@Module({
  providers: [{ provide: APP_ENV, useValue: getEnv() }],
  exports: [APP_ENV],
})
export class AppConfigModule {}
