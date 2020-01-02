import { createSelector } from 'reselect';
import { RootState } from '../store/root-reducer';
import { ConnectedAccount } from './types';
import { createCompoundId, convertAmountFromYnab } from './utils';

export default createSelector(
  (state: RootState) => state.accounts,
  (state: RootState) => state.sbanken.accounts,
  (state: RootState) => state.ynab.accounts,
  (connectedAccounts, sbankenAccounts, ynabAccounts) => {
    return connectedAccounts.map((source) => {
      if (!sbankenAccounts[source.sbankenId] || !ynabAccounts[source.ynabId]) return null;

      const connectedAccount: ConnectedAccount = {
        ...source,
        creditLimit: sbankenAccounts[source.sbankenId].creditLimit ?? 0,
        compoundId: createCompoundId(source),
        clearedBankBalance: sbankenAccounts[source.sbankenId].balance,
        clearedBudgetBalance: convertAmountFromYnab(ynabAccounts[source.ynabId].cleared_balance),
        unclearedBankBalance: sbankenAccounts[source.sbankenId].available,
        unclearedBudgetBalance: convertAmountFromYnab(ynabAccounts[source.ynabId].balance),
      };

      return connectedAccount;
    }).filter(Boolean);
  }
);
