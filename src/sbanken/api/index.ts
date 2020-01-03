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

// TODO: Flesh out interface
export interface SbankenTransaction {
  amount: number;
  transactionDetail?: {
    amountDescription: string;
    cid: string;
    formattedAccountNumber:	string;
    numericReference: number;
    payerName: string;
    receiverName: string;
    registrationDate: string;
    transactionId: number;
  };
  text: string;
  transactionDetailSpecified: boolean;
}

export enum SbankenAccountType {
  Standard = 'Standard account',
  CreditCard = 'Creditcard account'
}
