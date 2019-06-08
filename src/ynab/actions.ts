import { Action } from 'redux';

export enum YnabActionTypes {
  UpdateAccessToken = 'ynab/update-access-token'
}

export interface UpdateYnabAccessTokenAction extends Action<YnabActionTypes.UpdateAccessToken> {
  accessToken: string;
  budgetId: string;
}

export const updateYnabAccessToken = (accessToken: string, budgetId: string): UpdateYnabAccessTokenAction => ({
  type: YnabActionTypes.UpdateAccessToken,
  accessToken,
  budgetId,
});

export const actions = {
  updateYnabAccessToken,
};

export type YnabAction =
  UpdateYnabAccessTokenAction
