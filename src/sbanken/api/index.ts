import { DateTime } from 'luxon';

export const sbankenApiBaseUrl = 'https://api.sbanken.no/exec.bank/api/v1';

export interface SbankenAccessToken {
  token: string;
  expiry: string;
}

export interface SbankenTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export const transformAccessToken = (response: SbankenTokenResponse) => {
  const expiry = DateTime.local().plus({ seconds: response.expires_in });
  return {
    token: response.access_token,
    expiry: expiry.toISO(),
  } as SbankenAccessToken;
};

export enum SbankenAccountType {
  Standard = 'Standard account',
  CreditCard = 'Creditcard account'
}

export interface SbankenAccount {
  accountId: string;
  accountNumber: string;
  accountType: SbankenAccountType;
  available: number;
  balance: number;
  creditLimit: number;
  name: string;
  ownerCustomerId: string;
}

export interface SbankenTransaction {
  accountingDate: string;
  amount: number;
  cardDetailsSpecified: boolean;
  interestDate: string;
  isReservation: boolean;
  otherAccountNumberSpecified: boolean;
  reservationType: string | null;
  source: string;
  text: string;
  transactionDetailSpecified: boolean;
  transactionType: string;
  transactionTypeCode: number;
  transactionTypeText: string;
}

export interface SbankenTransactionWithId extends SbankenTransaction {
  id: string;
}
