import type { EntityState } from '@reduxjs/toolkit';

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

enum SbankenTransactionSourceType {
  AccountStatement,
  Archive,
}

interface SbankenTransactionBase {
  transactionId: string;
  accountingDate: string;
  interestDate: string;
  amount: number;
  text: string;
  transactionType: string;
  transactionTypeCode: number;
  transactionTypeText: string;
  source: SbankenTransactionSourceType;
}

export type SbankenTransaction = SbankenTransactionBase &
  (
    | {
        cardDetails: {
          cardNumber: string;
          currencyAmount: number;
          currencyRate: number;
          merchantCategoryCode: string;
          merchantCategoryDescription: string;
          merchantCity: string;
          merchantName: string;
          originalCurrencyCode: string;
          purchaseDate: string;
          transactionId: string;
        };
        cardDetailsSpecified: true;
      }
    | {
        cardDetails: undefined;
        cardDetailsSpecified: false;
      }
  );

export type SbankenTransactionWithAccountId = SbankenTransaction & {
  accountId: string;
  inferredDate?: string;
};

export interface SbankenGetTransactionsRequest {
  accountId: string;
  fromDate: string;
}

export interface SbankenGetTransactionsEntities {
  transactions: EntityState<SbankenTransactionWithAccountId>;
}
