import { takeLatest, takeEvery, call } from 'redux-saga/effects';
import { YnabActionType } from './reducer';
import { getAccountsSaga } from './api/get-accounts';
import { storeToken, storeBudgetId } from './utils';
import { getTransactionsSaga } from './api/get-transactions';

export default function* () {
  yield takeLatest(YnabActionType.GetAccountsRequest, getAccountsSaga);

  // yield takeEvery(YnabActionType.GetAccountsResponse, function* () {
  //   const { serverKnowledge } = yield select((state: RootState) => state.ynab);
  //   yield call(storeServerKnowledge, serverKnowledge);
  // });

  yield takeEvery(YnabActionType.SetToken, function* ({ token }: any) {
    yield call(storeToken, token);
  });

  yield takeEvery(YnabActionType.SetBudget, function* ({ budgetId }: any) {
    yield call(storeBudgetId, budgetId);
  });

  yield takeLatest(YnabActionType.GetTransactionsRequest, getTransactionsSaga);
}
