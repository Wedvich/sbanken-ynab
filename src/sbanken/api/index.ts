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

export interface SbankenCardDetails {
  cardNumber?: string;
  currencyAmount: number;
  currencyRate: number;
  merchantCategoryCode?: string;
  merchantCategoryDescription?: string;
  merchantCity?: string;
  merchantName?: string;
  originalCurrencyCode?: string;
  purchaseDate: string;
  transactionId?: string;
}

export interface SbankenTransaction {
  accountingDate: string;
  amount: number;
  cardDetails?: SbankenCardDetails;
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

export interface SbankenTransactionEnriched extends SbankenTransaction {
  accountId: string;
  date: string;
  id: string;
}

export const patchDate = (accountingDate: string, text: string, purchaseDate?: string) => {
  if (!purchaseDate) {
    const textDateFragments = /^(\d{2})\.(\d{2})/.exec(text);
    if (!textDateFragments) return accountingDate;

    const textDate = DateTime.fromObject({
      'day': Number.parseInt(textDateFragments[1]),
      'month': Number.parseInt(textDateFragments[2]),
    });

    if (!textDate.isValid) return accountingDate;

    const accountingDateTime = DateTime.fromISO(accountingDate);
    return textDate.set({ 'year': accountingDateTime.get('year') }).toISO();
  }

  const purchaseDateTime = DateTime.fromISO(purchaseDate);
  const accountingDateTime = DateTime.fromISO(accountingDate);

  return purchaseDateTime.set({ 'year': accountingDateTime.get('year') }).toISO();
};
