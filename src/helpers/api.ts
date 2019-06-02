import { AxiosRequestConfig } from 'axios';

/**
 * Creates an interceptor that will log an error message if the API is called before
 * it has been connnected to the Redux store.
 * @param apiName The name of the API. This will be displayed in the error message.
 */
export const createNotConnectedInterceptor = (apiName: string) => (config: AxiosRequestConfig) => {
  console.error(
    `You must call %cconnect(store)%c for the ${apiName} API before using it!`,
    'font-weight: bold;',
    'font-weight: inherit',
  );

  return config;
};
