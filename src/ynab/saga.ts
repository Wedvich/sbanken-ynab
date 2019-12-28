import { takeLatest, takeEvery, call } from 'redux-saga/effects';
import { YnabActionType } from './reducer';
import { getAccountsSaga } from './api/get-accounts';
import { storeServerKnowledge, storeToken, storeBudgetId } from './utils';

export default function* () {
  yield takeLatest(YnabActionType.GetAccountsRequest, getAccountsSaga);

  yield takeEvery(YnabActionType.GetAccountsResponse, function* ({ serverKnowledge }: any) {
    yield call(storeServerKnowledge, serverKnowledge);
  });

  yield takeEvery(YnabActionType.SetToken, function* ({ token }: any) {
    yield call(storeToken, token);
  });

  yield takeEvery(YnabActionType.SetBudget, function* ({ budgetId }: any) {
    yield call(storeBudgetId, budgetId);
  });
}
