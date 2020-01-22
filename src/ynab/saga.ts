import { takeLatest, call, put } from 'redux-saga/effects';
import { YnabActionType } from './reducer';
import { getAccountsSaga } from './api/get-accounts';
import { storeToken, storeBudgetId } from './utils';
import { getTransactionsSaga } from './api/get-transactions';
import { createTransactionSaga } from './api/create-transaction';
import { getBudgetsRequest, getBudgetsSaga } from './api/get-budgets';

export default function* () {
  yield takeLatest(YnabActionType.GetAccountsRequest, getAccountsSaga);

  yield takeLatest(YnabActionType.SetToken, function* ({ token }: any) {
    yield call(storeToken, token);
    yield put(getBudgetsRequest());
  });

  yield takeLatest(YnabActionType.SetBudget, function* ({ budgetId }: any) {
    yield call(storeBudgetId, budgetId);
  });

  yield takeLatest(YnabActionType.GetTransactionsRequest as any, getTransactionsSaga);
  yield takeLatest(YnabActionType.CreateTransactionRequest as any, createTransactionSaga);
  yield takeLatest(YnabActionType.GetBudgetsRequest as any, getBudgetsSaga);
}
