import type { SbankenTransactionBase } from './types';

const baseEqualityKeys: ReadonlyArray<keyof SbankenTransactionBase> = [
  'amount',
  'transactionTypeCode',
  'accountingDate',
  'amount',
  'interestDate',
  'transactionType',
  'transactionTypeText',
];

export function areBaseTransactionsEqual(
  a?: SbankenTransactionBase,
  b?: SbankenTransactionBase
): boolean {
  if (!a || !b) return false;
  for (const key of baseEqualityKeys) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}
