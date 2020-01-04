import { select, call, put } from 'redux-saga/effects';
import { YnabActionType, YnabState } from '../reducer';
import { RootState } from '../../store/root-reducer';
import { YnabTransaction, ynabApiBaseUrl } from '.';

export const getTransactionsRequest = (accountId: string) => ({
  type: YnabActionType.GetTransactionsRequest as YnabActionType.GetTransactionsRequest,
  accountId,
});

export const getTransactionsResponse = (transactions: YnabTransaction[], serverKnowledge: number) => ({
  type: YnabActionType.GetTransactionsResponse as YnabActionType.GetTransactionsResponse,
  transactions,
  serverKnowledge,
});

// TODO: Typed action maybe?
export function* getTransactionsSaga({ accountId }) {
  const { personalAccessToken, budgetId, serverKnowledge }: YnabState = yield select((state: RootState) => state.ynab);
  const url = [
    `${ynabApiBaseUrl}/budgets/${budgetId}/accounts/${accountId}/transactions`,
    '?since_date=2019-12-30',
    `&last_knowledge_of_server=${serverKnowledge[YnabActionType.GetTransactionsRequest] ?? 0}`,
  ];
  const response = yield call(
    fetch,
    url.join(''),
    {
      headers: new Headers({
        'Accept': 'application/json',
        'Authorization': `Bearer ${personalAccessToken}`,
      }),
    }
  );

  const transactionsResponse = yield call([response, response.json]);

  const { transactions, server_knowledge: nextServerKnowledge } = transactionsResponse.data;

  yield put(getTransactionsResponse(transactions, nextServerKnowledge));
}
