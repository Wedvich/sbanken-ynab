import type { LinkedAccount } from './accounts';
import type { SbankenCredential } from './sbanken';

export const ACCOUNTS_STORAGE_KEY = 'accounts';
export const RANGE_STORAGE_KEY = 'range';
export const SBANKEN_CREDENTIALS_KEY = 'sbanken:credentials';
export const STORAGE_VERSION_KEY = 'version';
export const YNAB_BUDGET_KEY = 'ynab:budget';
export const YNAB_TOKENS_KEY = 'ynab:tokens';

const storageVersion = 1;

function migrateSingleYnabBudget() {
  const budgetId = localStorage.getItem(YNAB_BUDGET_KEY);
  if (!budgetId) return;

  try {
    const budgetIds = JSON.parse(budgetId);
    if (Array.isArray(budgetIds)) return;
  } catch {}

  localStorage.setItem(YNAB_BUDGET_KEY, JSON.stringify([budgetId]));
  console.debug('Migrated YNAB budget');

  const accounts = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  if (!accounts) return;

  try {
    const linkedAccounts = JSON.parse<Array<LinkedAccount>>(accounts);
    linkedAccounts.forEach((account) => {
      account.ynabBudgetId = budgetId;
    });
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(linkedAccounts));
    console.debug('Migrated accounts to include YNAB budget ID');
  } catch {}
}

function migrateSingleSbankenClient() {
  let sbankenCredentials: Array<SbankenCredential> | string | null =
    localStorage.getItem(SBANKEN_CREDENTIALS_KEY);
  if (!sbankenCredentials) return;

  try {
    sbankenCredentials = JSON.parse<Array<SbankenCredential>>(sbankenCredentials);
    if (!Array.isArray(sbankenCredentials)) return;
  } catch {
    return;
  }

  if (sbankenCredentials.length !== 1) return;

  const [credential] = sbankenCredentials;

  const accounts = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  if (!accounts) return;

  try {
    const linkedAccounts = JSON.parse<Array<LinkedAccount>>(accounts);
    linkedAccounts.forEach((account) => {
      account.sbankenClientId = credential.clientId;
    });
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(linkedAccounts));
    console.debug('Migrated accounts to include Sbanken client ID');
  } catch {}
}

(function applyMigrations() {
  let versionInStorage = +(localStorage.getItem(STORAGE_VERSION_KEY) ?? '0');
  if (isNaN(versionInStorage)) versionInStorage = 0;

  if (versionInStorage >= storageVersion) {
    return;
  }

  if (versionInStorage < 1) {
    migrateSingleYnabBudget();
    migrateSingleSbankenClient();
  }

  localStorage.setItem(STORAGE_VERSION_KEY, storageVersion.toString());
})();
