export enum YnabStorageKey {
  BudgetId = 'ynab/budget-id',
  PersonalAccessToken = 'ynab/personal-access-token',
  ServerKnowledge = 'ynab/server-knowledge'
}

export const getStoredToken = () =>
  localStorage.getItem(YnabStorageKey.PersonalAccessToken) || null;

export const storeToken = (token: string) =>
  localStorage.setItem(YnabStorageKey.PersonalAccessToken, token);

export const getStoredBudgetId = () =>
  localStorage.getItem(YnabStorageKey.BudgetId) || null;

export const storeBudgetId = (budgetId: string) =>
  localStorage.setItem(YnabStorageKey.BudgetId, budgetId);

export const getStoredServerKnowledge = () => {
  try {
    const storedServerKnowledge = Number.parseInt(localStorage.getItem(YnabStorageKey.ServerKnowledge));
    return !Number.isNaN(storedServerKnowledge) ? storedServerKnowledge : 0;
  } catch {
    return 0;
  }
};

export const storeServerKnowledge = (serverKnowledge: number) =>
  localStorage.setItem(YnabStorageKey.ServerKnowledge, serverKnowledge.toString());
