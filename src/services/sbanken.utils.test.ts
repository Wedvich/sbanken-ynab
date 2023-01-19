import type { SbankenTransaction, SbankenTransactionBase } from './sbanken.types';
import * as utils from './sbanken.utils';

describe('inferDate', () => {
  it('returns undefined if the text is empty', () => {
    const transaction = {
      accountingDate: '2022-01-17T00:00:00',
      text: '',
    } as SbankenTransaction;

    const inferredDate = utils.inferDate(transaction);

    expect(inferredDate).toBeUndefined();
  });

  it('returns undefined if the text does not match the pattern', () => {
    const transaction = {
      accountingDate: '2022-01-17T00:00:00',
      text: 'Overføring',
    } as SbankenTransaction;

    const inferredDate = utils.inferDate(transaction);

    expect(inferredDate).toBeUndefined();
  });

  it('infers date from a credit transaction', () => {
    const transaction = {
      accountingDate: '2022-01-17T00:00:00',
      text: '*1234 15.01 Nok 1000.00 Abcd* N',
    } as SbankenTransaction;

    const inferredDate = utils.inferDate(transaction);

    expect(inferredDate).toBe('2022-01-15');
  });

  it('infers date from a credit transaction over new year', () => {
    const transaction = {
      accountingDate: '2022-01-02T00:00:00',
      text: '*1234 31.12 Nok 1000.00 Abcd* N',
    } as SbankenTransaction;

    const inferredDate = utils.inferDate(transaction);

    expect(inferredDate).toBe('2021-12-31');
  });

  it('infers date from a debit transaction', () => {
    const transaction = {
      accountingDate: '2022-01-17T00:00:00',
      text: '14.01 ABC DEF',
    } as SbankenTransaction;

    const inferredDate = utils.inferDate(transaction);

    expect(inferredDate).toBe('2022-01-14');
  });

  it('infers date from a debit transaction over new year', () => {
    const transaction = {
      accountingDate: '2022-01-03T00:00:00',
      text: '30.12 ABC DEF',
    } as SbankenTransaction;

    const inferredDate = utils.inferDate(transaction);

    expect(inferredDate).toBe('2021-12-30');
  });

  it('infers date from a direct transfer', () => {
    const transaction = {
      accountingDate: '2022-01-03T00:00:00',
      text: 'Fra: Martin Leby Wedvich Betalt: 01.01.22',
    } as SbankenTransaction;

    const inferredDate = utils.inferDate(transaction);

    expect(inferredDate).toBe('2022-01-01');
  });
});

describe('createSyntheticId', () => {
  it('creates the same ID for the same transaction', () => {
    const transaction: SbankenTransactionBase = {
      accountingDate: '2023-01-17T00:00:00',
      interestDate: '2023-01-17T00:00:00',
      amount: -218.0,
      text: '17.01 ABC DEF',
      transactionType: 'NETTGIRO',
      transactionTypeCode: 204,
      transactionTypeText: 'NETTGIRO',
    };

    const id1 = utils.createSyntheticId(transaction);
    const id2 = utils.createSyntheticId(transaction);

    expect(id1).toEqual(id2);
  });

  it('creates the same ID for different transactions with the same base', () => {
    const transaction1 = {
      accountingDate: '2023-01-17T00:00:00',
      interestDate: '2023-01-17T00:00:00',
      amount: -218.0,
      text: '17.01 ABC DEF',
      transactionType: 'NETTGIRO',
      transactionTypeCode: 204,
      transactionTypeText: 'NETTGIRO',
      isReservation: true,
    } as SbankenTransactionBase;

    const transaction2 = {
      accountingDate: '2023-01-17T00:00:00',
      interestDate: '2023-01-17T00:00:00',
      amount: -218.0,
      text: '17.01 ABC DEF',
      transactionType: 'NETTGIRO',
      transactionTypeCode: 204,
      transactionTypeText: 'NETTGIRO',
      isReservation: false,
    } as SbankenTransactionBase;

    const id1 = utils.createSyntheticId(transaction1);
    const id2 = utils.createSyntheticId(transaction2);

    expect(id1).toEqual(id2);
  });

  it('creates different IDs for different base transactions', () => {
    const transaction1: SbankenTransactionBase = {
      accountingDate: '2023-01-17T00:00:00',
      interestDate: '2023-01-17T00:00:00',
      amount: -218.0,
      text: '17.01 ABC DEF',
      transactionType: 'NETTGIRO',
      transactionTypeCode: 204,
      transactionTypeText: 'NETTGIRO',
    };

    const transaction2: SbankenTransactionBase = {
      accountingDate: '2023-01-18T00:00:00',
      interestDate: '2023-01-18T00:00:00',
      amount: 500.0,
      text: '18.01 ABC DEF',
      transactionType: 'NETTGIRO',
      transactionTypeCode: 204,
      transactionTypeText: 'NETTGIRO',
    };

    const id1 = utils.createSyntheticId(transaction1);
    const id2 = utils.createSyntheticId(transaction2);

    expect(id1).not.toEqual(id2);
  });
});
