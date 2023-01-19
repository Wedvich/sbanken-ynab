import type { EntityState } from '@reduxjs/toolkit';
import type { FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/dist/query';

export interface SbankenSuccessResponse<T> {
  availableItems: number;
  items: Array<T>;
}

export interface SbankenAccount {
  accountId: string;
  accountNumber: string;
  ownerCustomerId: string;
  name: string;
  accountType: 'Standard account' | 'Creditcard account';
  available: number;
  balance: number;
  creditLimit: number;
}

export interface SbankenAccountWithClientId extends SbankenAccount {
  clientId: string;
}

export enum SbankenTransactionSource {
  AccountStatement,
  Archive,
}

export interface SbankenTransactionBase {
  accountingDate: string;
  interestDate: string;
  amount: number;
  text: string;
  transactionType: string;
  transactionTypeCode: number;
  transactionTypeText: string;
}

export interface SbankenTransaction extends SbankenTransactionBase {
  transactionId: string;
  source: SbankenTransactionSource;
}

export interface SbankenReservedTransaction extends SbankenTransactionBase {
  isReservation: boolean;
  source: keyof typeof SbankenTransactionSource;
}

export type SbankenTransactionWithAccountId<T extends SbankenTransactionBase = SbankenTransaction> =
  T & {
    accountId: string;
    inferredDate?: string;
    isReserved?: boolean;
  };

export interface SbankenGetTransactionsRequest {
  accountId: string;
  fromDate: string;
}

export interface SbankenGetTransactionsEntities {
  transactions: EntityState<SbankenTransactionWithAccountId>;
}

export interface SbankenGetTransactionsRequestMeta extends FetchBaseQueryMeta {
  partialError?: FetchBaseQueryError;
}
