import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Store } from 'redux';

import { createNotConnectedInterceptor } from '../helpers/api';

const SBANKEN_API_BASE_URL = 'https://api.sbanken.no';

const instance = axios.create({ baseURL: SBANKEN_API_BASE_URL });
const notConnectedInterceptorId = instance.interceptors.request.use(createNotConnectedInterceptor('Sbanken'));

export enum SbankenErrorType {
  System = 'System',
  Input = 'Input',
  State = 'State',
  ServiceUnavailable = 'ServiceUnavailable',
  CustomHttpStatus = 'CustomHttpStatus',
  NotFound = 'NotFound',
}

export interface SbankenListResult<T> {
  availableItems: number;
  errorMessage: string | null;
  errorType: SbankenErrorType | null;
  isError: boolean;
  items: Array<T>;
  traceId: string | null;
}

export interface SbankenAccount {
  accountId: string;
  accountNumber: string;
  accountType: string;
  available: number;
  balance: number;
  creditLimit: number;
  name: string;
  ownerCustomerId: string;
}

export interface SbankenTransaction {

}

export const api = {
  getAccounts: (): Promise<AxiosResponse<SbankenListResult<SbankenAccount>>> =>
    instance.get('/bank/api/v1/Accounts'),
  getTransactions: (accountId: string): Promise<AxiosResponse<SbankenListResult<SbankenTransaction>>> =>
    instance.get(`/bank/api/v1/Transactions/${accountId}`) ,
};

const tokenAndCustomerIdSelector = (state: any) => {
  const { token, customerId }: { token: string; customerId: string; } = state.authentication.sbanken;
  return { token, customerId };
};

export const connect = (store: Store) => {
  instance.interceptors.request.eject(notConnectedInterceptorId);
  instance.interceptors.request.use((config: AxiosRequestConfig) => {
    const { token, customerId } = tokenAndCustomerIdSelector(store.getState());
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
      'customerId': customerId,
    };
    return config;
  });
};
