import { YnabActionType, YnabState } from '../reducer';
import { YnabAccount } from './';
import { select, call, put } from 'redux-saga/effects';
import { RootState } from '../../store/root-reducer';
import { HttpError, HttpErrorSource } from '../../shared/utils';
import { ynabApiBaseUrl } from '../../shared/config';

export const getAccountsRequest = () => ({
  type: YnabActionType.GetAccountsRequest as YnabActionType.GetAccountsRequest,
});

export const getAccountsResponse = (
  accounts: YnabAccount[],
  serverKnowledge: number,
  error?: HttpError
) => ({
  type: YnabActionType.GetAccountsResponse as YnabActionType.GetAccountsResponse,
  accounts,
  serverKnowledge,
  error,
});

export function* getAccountsSaga() {
  const { personalAccessToken, budgetId, serverKnowledge }: YnabState = yield select(
    (state: RootState) => state.ynab
  );
  const response: Response = yield call(
    fetch,
    `${ynabApiBaseUrl}/budgets/${budgetId}/accounts?last_knowledge_of_server=${
      serverKnowledge[YnabActionType.GetAccountsRequest] ?? 0
    }`,
    {
      headers: new Headers({
        Accept: 'application/json',
        Authorization: `Bearer ${personalAccessToken}`,
      }),
    }
  );

  if (!response.ok) {
    const error: HttpError = {
      source: HttpErrorSource.YnabApi,
      statusCode: response.status,
      statusText: response.statusText,
    };

    return yield put(getAccountsResponse([], 0, error));
  }

  const accountsResponse = yield call([response, response.json]);

  const { accounts, server_knowledge: nextServerKnowledge } = accountsResponse.data;

  yield put(
    getAccountsResponse(
      accounts.filter((account: YnabAccount) => !account.deleted && !account.closed),
      nextServerKnowledge
    )
  );
}
