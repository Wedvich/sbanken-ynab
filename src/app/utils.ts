import { RootState } from '../store/root-reducer';
import { ConnectedAccountSource } from '../accounts/types';

export interface ExportedSettings {
  accounts: ConnectedAccountSource[];
  sbankenCredentials: string;
  sbankenCustomerId: string;
  ynabBudgetId: string;
  ynabPersonalAccessToken: string;
}

export const exportSettingsSelector = (state: RootState) => {
  const settings: ExportedSettings = {
    accounts: state.accounts,
    sbankenCredentials: state.sbanken.credentials,
    sbankenCustomerId: state.sbanken.customerId,
    ynabBudgetId: state.ynab.budgetId,
    ynabPersonalAccessToken: state.ynab.personalAccessToken,
  };

  return btoa(JSON.stringify(settings));
};

export const decodeSettings = (encodedSettings: string) => {
  try {
    const settings: ExportedSettings = JSON.parse(atob(encodedSettings));
    // TODO: Validate
    return settings;
  } catch {
    return null;
  }
};
