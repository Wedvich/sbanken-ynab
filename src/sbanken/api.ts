import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Store } from 'redux';

import { Api } from '../helpers/api';

const SBANKEN_API_BASE_URL = 'https://api.sbanken.no';

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

const tokenAndCustomerIdSelector = (state: any) => {
  const { token, customerId }: { token: string; customerId: string; } = state.authentication.sbanken;
  return { token, customerId };
};

export class SbankenApi extends Api {
  constructor() {
    super('Sbanken', SBANKEN_API_BASE_URL);
  }

  public connect(store: Store) {
    super.connect(store);
    this.instance.interceptors.request.use((config: AxiosRequestConfig) => {
      const { token, customerId } = tokenAndCustomerIdSelector(this.getState!());
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
        'customerId': customerId,
      };
      return config;
    });
  }

  getAccounts(): Promise<AxiosResponse<SbankenListResult<SbankenAccount>>> {
    return this.instance.get('/bank/api/v1/Accounts');
  }
    
  getTransactions(accountId: string): Promise<AxiosResponse<SbankenListResult<SbankenTransaction>>> {
    return this.instance.get(`/bank/api/v1/Transactions/${accountId}`);
  } 
}

export const api = new SbankenApi();
