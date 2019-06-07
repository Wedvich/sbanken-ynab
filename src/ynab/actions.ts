import { Action } from 'redux';

export enum YnabActionTypes {
  UpdateAccessToken = 'ynab/update-access-token'
}

export interface UpdateYnabAccessTokenAction extends Action<YnabActionTypes.UpdateAccessToken> {
  accessToken: string;
}

export const updateYnabAccessToken = (accessToken: string): UpdateYnabAccessTokenAction => ({
  type: YnabActionTypes.UpdateAccessToken,
  accessToken,
});

export const actions = {
  updateYnabAccessToken,
};

export type YnabAction =
  UpdateYnabAccessTokenAction
