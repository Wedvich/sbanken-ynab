import { DateTime } from 'luxon';
import { SbankenAccessToken } from './api';

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

export const getStoredCustomerId = () =>
  localStorage.getItem(SbankenStorageKey.CustomerId) || null;

export const storeCustomerId = (customerId: string) =>
  localStorage.setItem(SbankenStorageKey.CustomerId, customerId);

export const getStoredCredentials = () =>
  localStorage.getItem(SbankenStorageKey.Credentials) || null;

export const storeCredentials = (credentials: string) =>
  localStorage.setItem(SbankenStorageKey.Credentials, credentials);
