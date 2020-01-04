import { ConnectedAccountSource } from './types';
import { DateTime } from 'luxon';

export enum AccountsStorageKey {
  Sources = 'accounts/sources',
}

export const getStoredAccountSources = (): ConnectedAccountSource[] => {
  const storedAccountSources = localStorage.getItem(AccountsStorageKey.Sources);
  if (!storedAccountSources) return [];
  try {
    return JSON.parse(storedAccountSources) as ConnectedAccountSource[];
  } catch {
    return [];
  }
};

export const storeAccountSources = (sources: ConnectedAccountSource[]) =>
  localStorage.setItem(AccountsStorageKey.Sources, JSON.stringify(sources));

export const createCompoundId = (source: ConnectedAccountSource) =>
  [source.sbankenId, source.ynabId].map((id) =>
    id.replace(/[\W_]+/g, '').slice(0, 4).toLowerCase()).join('');

export const convertAmountFromYnab = (amount: number) =>
  Number.parseFloat((amount / 1000).toFixed(2));

const currencyConverter = new Intl.NumberFormat('no-nb', { style: 'currency', currency: 'NOK' });

export const formatCurrency = (amount: number) =>
  currencyConverter.format(amount);

export const formatDate = (date: DateTime) =>
  date.toFormat('yyyy-MM-dd');
