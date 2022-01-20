import type { DateTime } from 'luxon';
import type { SbankenTransaction } from './sbanken/types';
import type { YnabTransaction } from './ynab';

export interface LinkedTransaction {
  amount: number;
  date: DateTime;
  sbankenTransactionId: string;
  ynabImportId?: string;
  ynabTranscationId: string;
}

export function isYnabTransaction(
  transaction: SbankenTransaction | YnabTransaction | LinkedTransaction
): transaction is YnabTransaction {
  return (transaction as YnabTransaction).account_id !== undefined;
}

export const isLinkedTransaction = (
  transaction: SbankenTransaction | YnabTransaction | LinkedTransaction
): transaction is LinkedTransaction => {
  return (
    !!(transaction as LinkedTransaction).sbankenTransactionId &&
    !!(transaction as LinkedTransaction).ynabTranscationId
  );
};

export const linkTransactions = (
  sbankenTransactions: Array<SbankenTransaction>,
  ynabTransactions: Array<YnabTransaction>
): Array<SbankenTransaction | YnabTransaction | LinkedTransaction> => {
  const clonedSbankenTransactions = sbankenTransactions.slice();
  const clonedYnabTransactions = ynabTransactions.slice();

  const transactions: Array<SbankenTransaction | YnabTransaction | LinkedTransaction> = [
    ...(clonedSbankenTransactions ?? []),
    ...(clonedYnabTransactions ?? []),
  ].sort((a, b) => {
    const aSort = isYnabTransaction(a) ? a.date : a.accountingDate;
    const bSort = isYnabTransaction(b) ? b.date : b.accountingDate;

    return bSort.localeCompare(aSort);
  });

  return transactions;
};
