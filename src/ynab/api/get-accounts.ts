import { YnabActionType, YnabState } from '../reducer';
import { YnabAccount, ynabApiBaseUrl } from './';
import { select, call, put } from 'redux-saga/effects';
import { RootState } from '../../store/root-reducer';

export const getAccountsRequest = () => ({
  type: YnabActionType.GetAccountsRequest as YnabActionType.GetAccountsRequest,
});

export const getAccountsResponse = (accounts: YnabAccount[], serverKnowledge: number) => ({
  type: YnabActionType.GetAccountsResponse as YnabActionType.GetAccountsResponse,
  accounts,
  serverKnowledge,
});

export function* getAccountsSaga() {
  const { personalAccessToken, budgetId, serverKnowledge }: YnabState = yield select((state: RootState) => state.ynab);
  const response = yield call(
    fetch,
    `${ynabApiBaseUrl}/budgets/${budgetId}/accounts?last_knowledge_of_server=${serverKnowledge[YnabActionType.GetAccountsRequest] ?? 0}`,
    {
      headers: new Headers({
        'Accept': 'application/json',
        'Authorization': `Bearer ${personalAccessToken}`,
      }),
    }
  );

  const accountsResponse = yield call([response, response.json]);

  const { accounts, server_knowledge: nextServerKnowledge } = accountsResponse.data;

  yield put(getAccountsResponse(accounts, nextServerKnowledge));
}
