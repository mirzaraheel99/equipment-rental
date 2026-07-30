import { ApiClient } from '@erms/api-client';
import { createNullAuthTokenProvider } from '@erms/auth';

import { publicEnv } from './env';

export const apiClient = new ApiClient({
  baseUrl: publicEnv.NEXT_PUBLIC_API_BASE_URL,
  authTokenProvider: createNullAuthTokenProvider(),
});
