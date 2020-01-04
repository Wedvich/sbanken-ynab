export enum YnabStorageKey {
  BudgetId = 'ynab/budget-id',
  PersonalAccessToken = 'ynab/personal-access-token',
  ServerKnowledge = 'ynab/server-knowledge'
}

export interface YnabServerKnowledge {
  [key: string]: number | null;
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
    const storedServerKnowledge = JSON.parse(localStorage.getItem(YnabStorageKey.ServerKnowledge));
    return Object.keys(storedServerKnowledge).reduce((serverKnowledge, key) => {
      try {
        const serverKnowledgeValue = Number.parseInt(storedServerKnowledge[key]);
        if (!Number.isNaN(serverKnowledgeValue)) {
          serverKnowledge[key] = serverKnowledgeValue;
        }
      // eslint-disable-next-line no-empty
      } catch {}

      return serverKnowledge;
    }, {});
    // const storedServerKnowledge = Number.parseInt(localStorage.getItem(YnabStorageKey.ServerKnowledge));
    // return !Number.isNaN(storedServerKnowledge) ? storedServerKnowledge : 0;
  } catch {
    localStorage.removeItem(YnabStorageKey.ServerKnowledge);
    return {};
  }
};

export const storeServerKnowledge = (serverKnowledge: number) =>
  localStorage.setItem(YnabStorageKey.ServerKnowledge, serverKnowledge.toString());
