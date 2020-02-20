import { ConnectedAccountSource } from './types';
import { useParams } from 'react-router-dom';

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

export const useAccountId = () => {
  const { accountId } = useParams<{ accountId?: string }>();
  return accountId;
};

export const getNumberClass = (amount: number) =>
  amount > 0 ? 'positive' : amount < 0 ? 'negative' : 'neutral';

export const compareConnectedAccountSource = (a: ConnectedAccountSource, b: ConnectedAccountSource) =>
  a.displayName === b.displayName && a.sbankenId === b.sbankenId && a.ynabId === b.ynabId;

export const fixCurrencyPrecision = (amount: number) =>
  Math.round(amount * 100) / 100;
