export const ACCOUNTS_STORAGE_KEY = 'accounts';
export const RANGE_STORAGE_KEY = 'range';
export const SBANKEN_CREDENTIALS_KEY = 'sbanken:credentials';
export const YNAB_BUDGET_KEY = 'ynab:budget';
export const YNAB_TOKENS_KEY = 'ynab:tokens';

/** Migrates a single YNAB budget into multiple budgets. */
(function migrateSingleYnabBudget() {
  const budgetId = localStorage.getItem(YNAB_BUDGET_KEY);
  if (!budgetId) return;

  try {
    const budgetIds = JSON.parse(budgetId);
    if (Array.isArray(budgetIds)) return;
  } catch {}

  localStorage.setItem(YNAB_BUDGET_KEY, JSON.stringify([budgetId]));
  console.debug(
    'Migrated YNAB budget: %c%s…%c → %c["%s…"]%c',
    'font-weight: bold',
    budgetId.slice(0, 5),
    'font-weight: normal',
    'font-weight: bold',
    budgetId.slice(0, 5),
    'font-weight: normal'
  );

  const accounts = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  if (!accounts) return;

  try {
    const linkedAccounts = JSON.parse(accounts);
    linkedAccounts.forEach((account: any) => {
      account.ynabBudgetId = budgetId;
    });
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(linkedAccounts));
  } catch {}
})();
