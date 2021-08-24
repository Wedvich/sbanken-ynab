import { createSelector } from '@reduxjs/toolkit';
import { getSbankenAccounts } from '../services/sbanken';
import { createCompositeAccountId, getLinkedAccounts, LinkedAccount } from '../services/accounts';
import { getYnabAccounts } from '../services/ynab';

export interface EnrichedAccount extends LinkedAccount {
  compositeId: string;
  sbankenWorkingBalance: number;
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

      const enrichedAccount: EnrichedAccount = {
        ...linkedAccount,
        compositeId: createCompositeAccountId(linkedAccount),
        sbankenWorkingBalance: sbankenAccount.balance,
        ynabWorkingBalance: ynabAccount.balance / 1000,
      };

      linkedAccounts.push(enrichedAccount);
      return linkedAccounts;
    }, []);
  }
);
