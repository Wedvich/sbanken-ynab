import { DateTime } from 'luxon';

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
  accountType: string;
  available: number;
  balance: number;
  creditLimit: number;
  name: string;
  ownerCustomerId: string;
}
