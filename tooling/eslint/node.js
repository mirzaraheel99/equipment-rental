// @ts-check
import globals from 'globals';

import { baseConfig } from './base.js';

/** Node-targeted services (NestJS API, worker). */
export const nodeConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message: 'Do not read process.env directly — use @erms/config.',
        },
      ],
    },
  },
];

export default nodeConfig;
