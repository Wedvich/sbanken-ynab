import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { Store, Dispatch } from 'redux';

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

export abstract class Api {
  protected instance: AxiosInstance;
  protected dispatch?: Dispatch;
  protected getState?: () => any;

  private notConnectedInterceptorId: number;

  constructor(apiName: string, baseUrl: string) {
    this.instance = axios.create({
      baseURL: baseUrl
    });
    this.notConnectedInterceptorId = this.instance.interceptors.request.use(createNotConnectedInterceptor(apiName));
  }

  /**
   * Connects the API with the Redux store instance, allowing it to read the state and dispatch actions.
   * @param store Redux store instance.
   */
  public connect(store: Store) {
    this.instance.interceptors.request.eject(this.notConnectedInterceptorId);
    this.dispatch = store.dispatch;
    this.getState = store.getState;
  }
}
