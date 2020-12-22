import { DateTime } from 'luxon';
import { SbankenAccessToken, SbankenTransaction } from './api';

export const sbankenDevPortalUrl = 'https://secure.sbanken.no/Personal/ApiBeta/Info/';

export enum SbankenStorageKey {
  AccessToken = 'sbanken/access-token',
  Credentials = 'sbanken/credentials',
  CustomerId = 'sbanken/customer-id',
}

export const validateAccessToken = (accessToken: SbankenAccessToken | null): boolean => {
  if (!accessToken?.token) return false;
  return DateTime.fromISO(accessToken.expiry) > DateTime.local();
};

export const getStoredAccessToken = (): SbankenAccessToken | null => {
  const storedAccessToken = sessionStorage.getItem(SbankenStorageKey.AccessToken);
  if (!storedAccessToken) return null;
  try {
    const accessToken = JSON.parse(storedAccessToken) as SbankenAccessToken;
    if (!validateAccessToken(accessToken)) {
      sessionStorage.removeItem(SbankenStorageKey.AccessToken);
      return null;
    }
    return accessToken;
  } catch {
    return null;
  }
};

export const storeAccessToken = (accessToken: SbankenAccessToken) =>
  sessionStorage.setItem(SbankenStorageKey.AccessToken, JSON.stringify(accessToken));

export const getStoredCustomerId = () => localStorage.getItem(SbankenStorageKey.CustomerId) || null;

export const storeCustomerId = (customerId: string) =>
  localStorage.setItem(SbankenStorageKey.CustomerId, customerId);

export const getStoredCredentials = () =>
  localStorage.getItem(SbankenStorageKey.Credentials) || null;

export const storeCredentials = (credentials: string) =>
  localStorage.setItem(SbankenStorageKey.Credentials, credentials);

export const encodeCredentials = (clientId: string, clientSecret: string) =>
  btoa(`${encodeURIComponent(clientId)}:${encodeURIComponent(clientSecret)}`);

export const decodeCredentials = (
  credentials: string
): { clientId: string; clientSecret: string } | null => {
  if (!credentials) return null;
  try {
    const [clientId, clientSecret] = atob(credentials)
      .split(':')
      .map((part) => decodeURIComponent(part));
    return {
      clientId,
      clientSecret,
    };
  } catch {
    return null;
  }
};

const encoder = new TextEncoder();

export const computeTransactionId = async (transaction: SbankenTransaction) => {
  const data = encoder.encode(JSON.stringify(transaction));
  const hash = await window.crypto.subtle.digest('sha-1', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
};
