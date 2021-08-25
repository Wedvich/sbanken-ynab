import { createSelector } from '@reduxjs/toolkit';
import { getSbankenAccounts } from '../services/sbanken';
import { createCompositeAccountId, getLinkedAccounts, LinkedAccount } from '../services/accounts';
import { getYnabAccounts } from '../services/ynab';

export interface EnrichedAccount extends LinkedAccount {
  compositeId: string;
  sbankenClearedBalance: number;
  sbankenUnclearedBalance: number;
  sbankenWorkingBalance: number;
  ynabClearedBalance: number;
  ynabUnclearedBalance: number;
  ynabWorkingBalance: number;
}

export const getEnrichedAccounts = createSelector(
  [getLinkedAccounts, getSbankenAccounts, getYnabAccounts],
  (linkedAccounts, sbankenAccounts, ynabAccounts): ReadonlyArray<EnrichedAccount> => {
    return linkedAccounts.reduce<Array<EnrichedAccount>>((linkedAccounts, linkedAccount) => {
      const sbankenAccount = sbankenAccounts.find(
        (a) => a.accountId === linkedAccount.sbankenAccountId
      );
      if (!sbankenAccount) return linkedAccounts;

      const ynabAccount = ynabAccounts.find((a) => a.id === linkedAccount.ynabAccountId);
      if (!ynabAccount) return linkedAccounts;

      let sbankenUnclearedBalance = 0;
      if (sbankenAccount.accountType === 'Creditcard account') {
        sbankenUnclearedBalance =
          -sbankenAccount.balance - (sbankenAccount.creditLimit - sbankenAccount.available);
      } else {
        sbankenUnclearedBalance = sbankenAccount.available - sbankenAccount.balance;
      }

      const enrichedAccount: EnrichedAccount = {
        ...linkedAccount,
        compositeId: createCompositeAccountId(linkedAccount),
        sbankenClearedBalance: sbankenAccount.balance,
        sbankenUnclearedBalance,
        sbankenWorkingBalance: sbankenAccount.balance + sbankenUnclearedBalance,
        ynabClearedBalance: ynabAccount.cleared_balance / 1000,
        ynabUnclearedBalance: ynabAccount.uncleared_balance / 1000,
        ynabWorkingBalance: ynabAccount.balance / 1000,
      };

      linkedAccounts.push(enrichedAccount);
      return linkedAccounts;
    }, []);
  }
);
