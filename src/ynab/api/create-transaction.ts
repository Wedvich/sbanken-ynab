import { put, select, call, all } from 'redux-saga/effects';
import { YnabActionType } from '../reducer';
import { RootState } from '../../store/root-reducer';
import transactionsSelector from '../../accounts/selectors/transactions';
import { NormalizedTransaction, ConnectedAccount } from '../../accounts/types';
import accountsSelector from '../../accounts/selectors/accounts';
import { YnabTransaction } from '.';
import { getTransactionsResponse } from './get-transactions';
import { getAccountsRequest } from './get-accounts';
import { HttpMethod } from '../../shared/utils';
import { ynabApiBaseUrl } from '../../shared/config';

export const createTransactionRequest = (transactionId: string) => ({
  type: YnabActionType.CreateTransactionRequest as YnabActionType.CreateTransactionRequest,
  transactionId,
});

export const createTransactionResponse = () => ({
  type: YnabActionType.CreateTransactionResponse as YnabActionType.CreateTransactionResponse,
});

export function* createTransactionSaga({ transactionId }) {
  const state: RootState = yield select();
  const transactions: NormalizedTransaction[] = yield call(transactionsSelector, state);
  const transaction = transactions.find((transaction) => transaction.id === transactionId);
  const accounts: ConnectedAccount[] = yield call(accountsSelector, state);
  const account = accounts.find((account) => account.compoundId === transaction.connectedAccountId);
  const { budgetId, personalAccessToken } = state.ynab;

  const ynabTransaction = {
    account_id: account.ynabId,
    payee_name: transaction.description[0] == "*" ? transaction.description.split(" ").slice(4,-2).join(" ") : transaction.description,
    amount: transaction.amount * 1000,
    date: transaction.payee[0] == "*" ? (new Date().getFullYear())+"-"+transaction.payee.split(" ")[1].split(".").reverse().join("-").toISO() : transaction.date.toISO(),
    import_id: transaction.id,
    memo: transaction.description,
    approved: false
  } as YnabTransaction;

  const response = yield call(
    fetch,
    `${ynabApiBaseUrl}/budgets/${budgetId}/transactions`,
    {
      method: HttpMethod.POST,
      headers: new Headers({
        'Accept': 'application/json',
        'Authorization': `Bearer ${personalAccessToken}`,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ transaction: ynabTransaction }),
    }
  );

  // TODO: Handle errors
  if (!response.ok) {
    return yield put(createTransactionResponse());
  }

  const createdTransactionResponse = yield call([response, response.json]);

  const { transaction: createdTransaction, server_knowledge: nextServerKnowledge } =
    createdTransactionResponse.data;

  yield all([
    put(createTransactionResponse()),
    put(getTransactionsResponse(
      [createdTransaction],
      account.ynabId,
      nextServerKnowledge,
    )),
    put(getAccountsRequest()),
  ]);
}
