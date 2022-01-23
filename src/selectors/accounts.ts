import { createSelector } from '@reduxjs/toolkit';
import { getSbankenAccounts, SbankenAccount } from '../services/sbanken';
import {
  accountsSlice,
  createCompositeAccountId,
  getLinkedAccounts,
  LinkedAccount,
} from '../services/accounts';
import { getYnabAccounts } from '../services/ynab';
import type { RootState } from '../services';

export interface EnrichedAccount extends LinkedAccount {
  compositeId: string;
  sbankenLinkOk: boolean;
  sbankenClearedBalance: number;
  sbankenUnclearedBalance: number;
  sbankenWorkingBalance: number;
  ynabLinkOk: boolean;
  ynabClearedBalance: number;
  ynabUnclearedBalance: number;
  ynabWorkingBalance: number;
}

export const getHasLoadedAllAccounts = (state: RootState) => {
  const slice = state[accountsSlice.name];
  return slice.hasLoadedSbankenAccounts && slice.hasLoadedYnabAccounts;
};

function getSbankenUnclearedBalance(sbankenAccount?: SbankenAccount): number {
  if (!sbankenAccount) return 0;

  if (sbankenAccount.accountType === 'Creditcard account') {
    return -sbankenAccount.balance - (sbankenAccount.creditLimit - sbankenAccount.available);
  }

  return sbankenAccount.available - sbankenAccount.balance;
}

export const getEnrichedAccounts = createSelector(
  [getLinkedAccounts, getSbankenAccounts, getYnabAccounts],
  (linkedAccounts, sbankenAccounts, ynabAccounts): ReadonlyArray<EnrichedAccount> => {
    return linkedAccounts.reduce<Array<EnrichedAccount>>((linkedAccounts, linkedAccount) => {
      const sbankenAccount = sbankenAccounts.find(
        (a) => a.accountId === linkedAccount.sbankenAccountId
      );

      const ynabAccount = ynabAccounts.find((a) => a.id === linkedAccount.ynabAccountId);

      const sbankenUnclearedBalance = getSbankenUnclearedBalance(sbankenAccount);

      const enrichedAccount: EnrichedAccount = {
        ...linkedAccount,
        compositeId: createCompositeAccountId(linkedAccount),
        sbankenLinkOk: !!sbankenAccount,
        sbankenClearedBalance: sbankenAccount?.balance ?? 0,
        sbankenUnclearedBalance,
        sbankenWorkingBalance: (sbankenAccount?.balance ?? 0) + sbankenUnclearedBalance,
        ynabLinkOk: !!ynabAccount,
        ynabClearedBalance: (ynabAccount?.cleared_balance ?? 0) / 1000,
        ynabUnclearedBalance: (ynabAccount?.uncleared_balance ?? 0) / 1000,
        ynabWorkingBalance: (ynabAccount?.balance ?? 0) / 1000,
      };

      linkedAccounts.push(enrichedAccount);
      return linkedAccounts;
    }, []);
  }
);

export const getTransactionsRange = (state: RootState) => state.accounts.range;
