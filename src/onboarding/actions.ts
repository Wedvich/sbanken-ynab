import { Action } from 'redux';

export enum OnboardingActionTypes {
  StoreSettings = 'onboarding/store-settings',
}

export interface StoreOnboardingSettingsAction extends Action<OnboardingActionTypes.StoreSettings> {
  sbankenClientId: string;
  sbankenClientSecret: string;
  sbankenCustomerId: string;
  ynabAccessToken: string;
  ynabBudgetId: string;
}

export const storeOnboardingSettings = (
  sbankenClientId: string,
  sbankenClientSecret: string,
  sbankenCustomerId: string,
  ynabAccessToken: string,
  ynabBudgetId: string,
): StoreOnboardingSettingsAction => ({
  type: OnboardingActionTypes.StoreSettings,
  sbankenClientId,
  sbankenClientSecret,
  sbankenCustomerId,
  ynabAccessToken,
  ynabBudgetId,
});

export const actions = {
  storeOnboardingSettings,
};

export type OnboardingAction =
  StoreOnboardingSettingsAction
