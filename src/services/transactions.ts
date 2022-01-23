import { groupBy } from 'lodash-es';
import { DateTime } from 'luxon';
import type { SbankenTransaction } from './sbanken/types';
import type { YnabTransaction } from './ynab';

export enum TransactionSource {
  Sbanken = 1,
  Ynab = 2,
}

export interface Transaction {
  amount: number;
  checksum?: number;
  date: DateTime;
  description?: string;
  source: TransactionSource;
  sbankenTransactionId?: string;
  ynabImportId?: string;
  ynabTranscationId?: string;
}

const convertSbankenTransaction = (sbankenTransaction: SbankenTransaction): Transaction => {
  const interestDate = DateTime.fromISO(sbankenTransaction.interestDate);
  const inferredDate = DateTime.fromISO(
    sbankenTransaction._inferredDate ?? sbankenTransaction.accountingDate
  );

  const transaction: Transaction = {
    amount: sbankenTransaction.amount,
    checksum: sbankenTransaction._checksum,
    date: +interestDate < +inferredDate ? interestDate : inferredDate,
    description: sbankenTransaction.text,
    source: TransactionSource.Sbanken,
    sbankenTransactionId: sbankenTransaction.transactionId,
  };

  return transaction;
};

const convertYnabTransaction = (ynabTransaction: YnabTransaction): Transaction => {
  const transaction: Transaction = {
    amount: ynabTransaction.amount,
    checksum: ynabTransaction._checksum,
    date: DateTime.fromISO(ynabTransaction.date),
    description: ynabTransaction.memo,
    source: TransactionSource.Ynab,
    ynabImportId: ynabTransaction.import_id,
    ynabTranscationId: ynabTransaction.id,
  };

  return transaction;
};

function createImportIdFromChecksum(checksum: number): string {
  return `sbanken-${checksum}`;
}

export function isYnabTransaction(
  transaction: SbankenTransaction | YnabTransaction | Transaction
): transaction is YnabTransaction {
  return (transaction as YnabTransaction).account_id !== undefined;
}

export const isLinkedTransaction = (
  transaction: SbankenTransaction | YnabTransaction | Transaction
): transaction is Transaction => {
  return (
    !!(transaction as Transaction).sbankenTransactionId &&
    !!(transaction as Transaction).ynabTranscationId
  );
};

export const linkTransactions = (
  sbankenTransactions: Array<SbankenTransaction>,
  ynabTransactions: Array<YnabTransaction>
): Array<Transaction> => {
  const sbankenTransactionsMap = groupBy(
    sbankenTransactions.map(convertSbankenTransaction).sort((a, b) => b.amount - a.amount),
    (t) => t.date.toISODate()
  );

  const ynabTransactionsMap = groupBy(
    ynabTransactions.map(convertYnabTransaction).sort((a, b) => b.amount - a.amount),
    (t) => t.date.toISODate()
  );

  const linkedTransactions: Array<Transaction> = [];

  function linkAndPushTransaction(
    sbankenTransaction: Transaction,
    ynabTransaction: Transaction,
    ynabTransactionsForDate: Array<Transaction>
  ) {
    sbankenTransaction.description = ynabTransaction.description || sbankenTransaction.description;
    sbankenTransaction.source |= TransactionSource.Ynab;
    sbankenTransaction.ynabImportId = ynabTransaction.ynabImportId;
    sbankenTransaction.ynabTranscationId = ynabTransaction.ynabTranscationId;

    ynabTransactionsForDate.splice(ynabTransactionsForDate.indexOf(ynabTransaction), 1);

    linkedTransactions.push(sbankenTransaction);
  }

  for (const [date, transactions] of Object.entries(sbankenTransactionsMap)) {
    const ynabTransactionsForDate = ynabTransactionsMap[date];
    if (!ynabTransactionsForDate) {
      Array.prototype.push.apply(linkedTransactions, transactions);
      continue;
    }

    for (const sbankenTransaction of transactions) {
      const matchingTransactions = ynabTransactionsForDate.filter(
        (t) => t.amount === sbankenTransaction.amount
      );

      if (matchingTransactions.length === 1) {
        const [ynabTransaction] = matchingTransactions;
        linkAndPushTransaction(sbankenTransaction, ynabTransaction, ynabTransactionsForDate);
      } else if (matchingTransactions.length > 1) {
        const maybeLinkedTransaction =
          matchingTransactions.find(
            (ynabTransaction) =>
              !!ynabTransaction.ynabImportId &&
              (ynabTransaction.ynabImportId === sbankenTransaction.sbankenTransactionId ||
                ynabTransaction.ynabImportId ===
                  createImportIdFromChecksum(sbankenTransaction.checksum))
          ) ?? matchingTransactions[0];

        linkAndPushTransaction(sbankenTransaction, maybeLinkedTransaction, ynabTransactionsForDate);
      } else {
        linkedTransactions.push(sbankenTransaction);
      }
    }
  }

  const unlinkedYnabTransactions = Object.values(ynabTransactionsMap).flat();
  Array.prototype.push.apply(linkedTransactions, unlinkedYnabTransactions);

  return linkedTransactions.sort((a, b) => +b.date - +a.date);
};
