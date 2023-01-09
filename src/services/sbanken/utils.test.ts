import { Settings as LuxonSettings } from 'luxon';
import type { SbankenTransaction } from './types';
import * as utils from './utils';

LuxonSettings.defaultZone = 'utc';

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
