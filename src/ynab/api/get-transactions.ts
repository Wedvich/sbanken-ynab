import { select, call, put } from 'redux-saga/effects';
import { YnabActionType, YnabState } from '../reducer';
import { RootState } from '../../store/root-reducer';
import { YnabTransaction } from '.';
import { ynabApiBaseUrl } from '../../shared/config';

export const getTransactionsRequest = (accountId: string) => ({
  type: YnabActionType.GetTransactionsRequest as YnabActionType.GetTransactionsRequest,
  accountId,
});

export const getTransactionsResponse = (
  transactions: YnabTransaction[],
  accountId: string,
  serverKnowledge: number,
) => ({
  type: YnabActionType.GetTransactionsResponse as YnabActionType.GetTransactionsResponse,
  transactions,
  accountId,
  serverKnowledge,
});

// TODO: Typed action maybe?
export function* getTransactionsSaga({ accountId }) {
  const { personalAccessToken, budgetId, serverKnowledge }: YnabState = yield select((state: RootState) => state.ynab);
  const serverKnowledgeForRequest = serverKnowledge[`${YnabActionType.GetTransactionsRequest}/${accountId}`];
  const url = [
    `${ynabApiBaseUrl}/budgets/${budgetId}/accounts/${accountId}/transactions`,
    '?since_date=2019-12-30',
    serverKnowledgeForRequest && `&last_knowledge_of_server=${serverKnowledgeForRequest}`,
  ].filter(Boolean);
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

  yield put(getTransactionsResponse(
    transactions.filter((transaction: YnabTransaction) => !transaction.deleted),
    accountId,
    nextServerKnowledge,
  ));
}
