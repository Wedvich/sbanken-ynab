/** @jest-environment jsdom */
const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

import { ACCOUNTS_STORAGE_KEY, SBANKEN_CREDENTIALS_KEY, YNAB_BUDGET_KEY } from './storage';

beforeEach(() => {
  jest.resetModules();
  localStorage.clear();
});

describe('migrateSingleYnabBudget', () => {
  it('should not migrate if budget is missing', async () => {
    await import('./storage');

    expect(setItemSpy).not.toHaveBeenCalledWith(YNAB_BUDGET_KEY, expect.anything());
  });

  it('should not migrate if budget is already an array', async () => {
    localStorage.setItem(YNAB_BUDGET_KEY, JSON.stringify(['a', 'b']));
    setItemSpy.mockClear();

    await import('./storage');

    expect(setItemSpy).not.toHaveBeenCalledWith(YNAB_BUDGET_KEY, expect.anything());
  });

  it('should migrate to an array', async () => {
    localStorage.setItem(YNAB_BUDGET_KEY, 'a');
    setItemSpy.mockClear();

    await import('./storage');

    expect(setItemSpy).toHaveBeenCalledWith(YNAB_BUDGET_KEY, JSON.stringify(['a']));
  });

  it('should migrate linked accounts', async () => {
    localStorage.setItem(YNAB_BUDGET_KEY, 'a');
    localStorage.setItem('accounts', JSON.stringify([{ ynabAccountId: 'b' }]));
    setItemSpy.mockClear();

    await import('./storage');

    expect(setItemSpy).toHaveBeenCalledWith(
      ACCOUNTS_STORAGE_KEY,
      JSON.stringify([{ ynabAccountId: 'b', ynabBudgetId: 'a' }])
    );
  });
});

describe('migrateSingleSbankenAccount', () => {
  it('should not migrate if credentials are unset', async () => {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify([{}]));
    setItemSpy.mockClear();

    await import('./storage');

    expect(setItemSpy).not.toHaveBeenCalledWith(ACCOUNTS_STORAGE_KEY, expect.anything());
  });

  it('should not migrate if credentials are empty', async () => {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify([{}]));
    localStorage.setItem(SBANKEN_CREDENTIALS_KEY, JSON.stringify([]));
    setItemSpy.mockClear();

    await import('./storage');

    expect(setItemSpy).not.toHaveBeenCalledWith(ACCOUNTS_STORAGE_KEY, expect.anything());
  });

  it('should not migrate if credentials are invalid', async () => {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify([{}]));
    localStorage.setItem(SBANKEN_CREDENTIALS_KEY, JSON.stringify('invalid'));
    setItemSpy.mockClear();

    await import('./storage');

    expect(setItemSpy).not.toHaveBeenCalledWith(ACCOUNTS_STORAGE_KEY, expect.anything());
  });

  it('should not migrate if there are more than one set of credentials', async () => {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify([{}]));
    localStorage.setItem(SBANKEN_CREDENTIALS_KEY, JSON.stringify([{}, {}]));
    setItemSpy.mockClear();

    await import('./storage');

    expect(setItemSpy).not.toHaveBeenCalledWith(ACCOUNTS_STORAGE_KEY, expect.anything());
  });

  it('should not migrate if there are no accounts', async () => {
    localStorage.setItem(SBANKEN_CREDENTIALS_KEY, JSON.stringify([{}]));
    setItemSpy.mockClear();

    await import('./storage');

    expect(setItemSpy).not.toHaveBeenCalledWith(ACCOUNTS_STORAGE_KEY, expect.anything());
  });

  it('should migrate accounts', async () => {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify([{ sbankenAccountId: 'a' }]));
    localStorage.setItem(SBANKEN_CREDENTIALS_KEY, JSON.stringify([{ clientId: 'b' }]));
    setItemSpy.mockClear();

    await import('./storage');

    expect(setItemSpy).toHaveBeenCalledWith(
      ACCOUNTS_STORAGE_KEY,
      JSON.stringify([{ sbankenAccountId: 'a', sbankenClientId: 'b' }])
    );
  });
});
