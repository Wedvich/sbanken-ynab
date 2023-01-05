/** @jest-environment jsdom */
const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

import { ACCOUNTS_STORAGE_KEY, YNAB_BUDGET_KEY } from './storage';

beforeEach(() => {
  jest.resetModules();
});

describe('migrateSingleYnabBudget', () => {
  it('should not migrate if budget is missing', () => {
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
