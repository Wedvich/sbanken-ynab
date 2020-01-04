import { createSelector } from 'reselect';
import { DateTime } from 'luxon';
import { RootState } from '../store/root-reducer';
import { ConnectedAccount, Transaction, TransactionSource } from './types';
import { createCompoundId, convertAmountFromYnab } from './utils';
import { SbankenAccountType } from '../sbanken/api';

export const accountsSelector = createSelector(
  (state: RootState) => state.accounts,
  (state: RootState) => state.sbanken.accounts,
  (state: RootState) => state.ynab.accounts,
  (connectedAccounts, sbankenAccounts, ynabAccounts) => {
    return connectedAccounts.map((source) => {
      const sbankenAccount = sbankenAccounts[source.sbankenId];
      const ynabAccount = ynabAccounts[source.ynabId];

      if (!sbankenAccount || !ynabAccounts[source.ynabId]) return null;

      const workingBankBalance = sbankenAccount.accountType === SbankenAccountType.CreditCard
        ? -(sbankenAccount.creditLimit - sbankenAccount.available)
        : sbankenAccount.available;

      const connectedAccount: Partial<ConnectedAccount> = {
        ...source,
        creditLimit: sbankenAccount.creditLimit ?? 0,
        compoundId: createCompoundId(source),
        clearedBankBalance: sbankenAccount.balance,
        clearedBudgetBalance: convertAmountFromYnab(ynabAccount.cleared_balance),
        unclearedBankBalance: workingBankBalance - sbankenAccount.balance,
        unclearedBudgetBalance: convertAmountFromYnab(ynabAccount.uncleared_balance),
        workingBankBalance,
        workingBudgetBalance: convertAmountFromYnab(ynabAccount.balance),
      };

      const diffs = {
        cleared: connectedAccount.clearedBudgetBalance - connectedAccount.clearedBankBalance,
        uncleared: connectedAccount.unclearedBudgetBalance - connectedAccount.unclearedBankBalance,
        working: connectedAccount.workingBudgetBalance - connectedAccount.workingBankBalance,
      };

      connectedAccount.diffs = Object.values(diffs).some(((value) => value !== 0))
        ? diffs
        : null;

      return connectedAccount as ConnectedAccount;
    }).filter(Boolean);
  }
);

export const transactionsSelector = createSelector(
  (state: RootState) => state.sbanken.transactions,
  (state: RootState) => state.ynab.transactions,
  (sbankenTransactions, ynabTransactions) => {
    return sbankenTransactions.map((sbankenTransaction) => ({
      amount: sbankenTransaction.amount,
      date: DateTime.fromISO(sbankenTransaction.accountingDate).toFormat('yyyy-MM-dd'),
      payee: sbankenTransaction.text,
      source: TransactionSource.Sbanken,
    } as Transaction)).concat(ynabTransactions.map((ynabTransaction) => ({
      amount: convertAmountFromYnab(ynabTransaction.amount),
      date: ynabTransaction.date,
      payee: ynabTransaction.payee_name,
      source: TransactionSource.Ynab,
    } as Transaction)));
  }
);
