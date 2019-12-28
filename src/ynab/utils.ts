export enum YnabStorageKey {
  ServerKnowledge = 'ynab/server-knowledge'
}

export const getStoredServerKnowledge = () => {
  try {
    const storedServerKnowledge = Number.parseInt(sessionStorage.getItem(YnabStorageKey.ServerKnowledge));
    return !Number.isNaN(storedServerKnowledge) ? storedServerKnowledge : 0;
  } catch {
    return 0;
  }
};
