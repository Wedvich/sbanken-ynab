import { DateTime } from 'luxon';
import { SbankenAccessToken } from './api';

export const validateAccessToken = (accessToken: SbankenAccessToken | null): boolean => {
  if (!accessToken?.token) return false;
  return DateTime.fromISO(accessToken.expiry) > DateTime.local();
};

export enum SbankenStorageKey {
  AccessToken = 'sbanken/access-token',
  CustomerId = 'sbanken/customer-id',
}

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

export const getStoredCustomerId = () =>
  sessionStorage.getItem(SbankenStorageKey.CustomerId) || null;
