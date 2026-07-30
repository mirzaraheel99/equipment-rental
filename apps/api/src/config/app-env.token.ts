/** Split from config.module.ts so importing this token alone never triggers
 * getEnv()'s fail-fast env validation as a side effect — needed so unit
 * tests can import services that depend on APP_ENV without a live env. */
export const APP_ENV = Symbol('APP_ENV');
