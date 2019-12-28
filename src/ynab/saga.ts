import { takeLatest, takeEvery, call } from 'redux-saga/effects';
import { YnabActionType } from './reducer';
import { getAccountsSaga } from './api/get-accounts';
import { YnabStorageKey } from './utils';

export default function* () {
  yield takeLatest(YnabActionType.GetAccountsRequest, getAccountsSaga);
  yield takeEvery(YnabActionType.GetAccountsResponse, function* ({ serverKnowledge }: any) {
    yield call([sessionStorage, sessionStorage.setItem], YnabStorageKey.ServerKnowledge, serverKnowledge);
  });
}
