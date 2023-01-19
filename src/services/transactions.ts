import { groupBy } from 'lodash-es';
import { DateTime } from 'luxon';
import type { SbankenReservedTransaction, SbankenTransactionWithAccountId } from './sbanken.types';
import type { YnabTransaction } from './ynab.types';

export enum TransactionSource {
  Sbanken = 1,
  Ynab = 2,
}

export interface Transaction {
  amount: number;
  date: DateTime;
  description?: string;
  isReserved?: boolean;
  source: TransactionSource;
  sbankenTransactionId?: string;
  ynabImportId?: string;
  ynabTranscationId?: string;
}

const conversionCache = new WeakMap<
  | SbankenTransactionWithAccountId
  | SbankenTransactionWithAccountId<SbankenReservedTransaction>
  | YnabTransaction,
  Transaction
>();

const convertSbankenTransaction = (
  sbankenTransaction: SbankenTransactionWithAccountId
): Transaction => {
  if (conversionCache.has(sbankenTransaction)) {
    return conversionCache.get(sbankenTransaction)!;
  }

  const interestDate = DateTime.fromISO(sbankenTransaction.interestDate);
  const inferredDate = DateTime.fromISO(
    sbankenTransaction.inferredDate ?? sbankenTransaction.accountingDate
  );

  const transaction: Transaction = {
    amount: sbankenTransaction.amount,
    date: +interestDate < +inferredDate ? interestDate : inferredDate,
    description: sbankenTransaction.text,
    source: TransactionSource.Sbanken,
    sbankenTransactionId: sbankenTransaction.transactionId,
  };

  conversionCache.set(sbankenTransaction, transaction);
  return transaction;
};

export const convertSbankenReservedTransaction = (
  sbankenTransaction: SbankenTransactionWithAccountId<SbankenReservedTransaction>
): Transaction => {
  if (conversionCache.has(sbankenTransaction)) {
    return conversionCache.get(sbankenTransaction)!;
  }

  const interestDate = DateTime.fromISO(sbankenTransaction.interestDate);
  const inferredDate = DateTime.fromISO(
    sbankenTransaction.inferredDate ?? sbankenTransaction.accountingDate
  );

  const transaction: Transaction = {
    amount: sbankenTransaction.amount,
    date: +interestDate < +inferredDate ? interestDate : inferredDate,
    description: sbankenTransaction.text,
    source: TransactionSource.Sbanken,
    isReserved: true,
  };

  conversionCache.set(sbankenTransaction, transaction);
  return transaction;
};

const convertYnabTransaction = (ynabTransaction: YnabTransaction): Transaction => {
  if (conversionCache.has(ynabTransaction)) {
    return conversionCache.get(ynabTransaction)!;
  }

  const transaction: Transaction = {
    amount: ynabTransaction.amount / 1000,
    date: DateTime.fromISO(ynabTransaction.date),
    description: ynabTransaction.memo || ynabTransaction.payee_name,
    source: TransactionSource.Ynab,
    ynabImportId: ynabTransaction.import_id,
    ynabTranscationId: ynabTransaction.id,
  };

  conversionCache.set(ynabTransaction, transaction);
  return transaction;
};

export function isYnabTransaction(
  transaction: SbankenTransactionWithAccountId | YnabTransaction | Transaction
): transaction is YnabTransaction {
  return (transaction as YnabTransaction).account_id !== undefined;
}

export const isLinkedTransaction = (
  transaction: SbankenTransactionWithAccountId | YnabTransaction | Transaction
): transaction is Transaction => {
  return (
    !!(transaction as Transaction).sbankenTransactionId &&
    !!(transaction as Transaction).ynabTranscationId
  );
};

export const linkTransactions = (
  sbankenTransactions: Array<SbankenTransactionWithAccountId> = [],
  ynabTransactions: Array<YnabTransaction> = []
): Array<Transaction> => {
  const sbankenTransactionsMap = groupBy(sbankenTransactions.map(convertSbankenTransaction), (t) =>
    t.date.toISODate()
  );

  const ynabTransactionsMap = groupBy(ynabTransactions.map(convertYnabTransaction), (t) =>
    t.date.toISODate()
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
              ynabTransaction.ynabImportId === sbankenTransaction.sbankenTransactionId
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
