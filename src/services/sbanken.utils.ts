import { DateTime } from 'luxon';
import type { SbankenTransaction } from './sbanken.types';

/** Matches the date part of `*1234 12.01 Nok 1000.00 Abcd`. */
const creditPurchasePattern = /^\*\d{4}\s+(\d{2}\.\d{2})/;

/** Matches the date part of `19.01 ABCDEF`. */
const debitPurchasePattern = /^(\d{2}\.\d{2})\s+.+/;

/** Matches the date part of `Fra: Abcd Betalt: 01.01.22` */
const directTransferPattern = /Betalt: (\d{2}\.\d{2}.\d{2})$/i;

export function inferDate(transaction?: SbankenTransaction): string | undefined {
  if (!transaction?.text) return;

  const inferredDate =
    creditPurchasePattern.exec(transaction.text)?.[1] ||
    debitPurchasePattern.exec(transaction.text)?.[1] ||
    directTransferPattern.exec(transaction.text)?.[1];

  if (inferredDate) {
    const accountingDate = DateTime.fromISO(transaction.accountingDate);
    const interestDate = DateTime.fromISO(transaction.interestDate);

    const baseDate = +interestDate < +accountingDate ? interestDate : accountingDate;

    const [day, month, year] = inferredDate.split('.');
    const dateUsingAccountingYear = baseDate.set({
      day: +day,
      month: +month,
    });

    if (year) {
      dateUsingAccountingYear.set({ year: +year + 2000 });
      return dateUsingAccountingYear.toISODate();
    }

    const dateUsingPreviousYear = dateUsingAccountingYear.minus({ years: 1 });

    const diffUsingAccountingYear = dateUsingAccountingYear.diff(baseDate);
    const diffUsingPreviousYear = dateUsingPreviousYear.diff(baseDate);

    return Math.abs(+diffUsingAccountingYear) <= Math.abs(+diffUsingPreviousYear)
      ? dateUsingAccountingYear.toISODate()
      : dateUsingPreviousYear.toISODate();
  }
}
