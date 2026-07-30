import { Global, Module } from '@nestjs/common';

import { getEnv } from './configuration.js';

export const APP_ENV = Symbol('APP_ENV');

@Global()
@Module({
  providers: [{ provide: APP_ENV, useValue: getEnv() }],
  exports: [APP_ENV],
})
export class AppConfigModule {}
