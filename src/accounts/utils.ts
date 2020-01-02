import { ConnectedAccountSource } from './types';

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
