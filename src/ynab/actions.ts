import { Action } from 'redux';

export enum YnabActionTypes {
  StoreAccessToken = 'ynab/store-access-token'
}

export interface StoreYnabAccessTokenAction extends Action<YnabActionTypes.StoreAccessToken> {
  accessToken: string;
}

export const storeYnabAccessToken = (accessToken: string): StoreYnabAccessTokenAction => ({
  type: YnabActionTypes.StoreAccessToken,
  accessToken,
});

export const actions = {
  storeYnabAccessToken,
};

export type YnabAction =
  StoreYnabAccessTokenAction
