import { AxiosResponse } from 'axios';

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
  items: T[];
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

export class SbankenApi extends Api {
  constructor() {
    super(SBANKEN_API_BASE_URL);
  }

  getAccounts(): Promise<AxiosResponse<SbankenListResult<SbankenAccount>>> {
    return this.instance.get('/bank/api/v1/Accounts');
  }
    
  getTransactions(accountId: string): Promise<AxiosResponse<SbankenListResult<{}>>> {
    return this.instance.get(`/bank/api/v1/Transactions/${accountId}`);
  } 
}

export const api = new SbankenApi();
