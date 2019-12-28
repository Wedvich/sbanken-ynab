import { takeLatest, put, call } from 'redux-saga/effects';
import { SbankenActionType, actions } from './reducer';
import { getTokenSaga } from './api/get-token';
import { getAccountsSaga } from './api/get-accounts';
import { SbankenStorageKey } from './utils';

export default function* () {
  yield takeLatest(SbankenActionType.SetCredentials, function* ({ customerId }: any) {
    yield put(actions.getTokenRequest());
    yield call([sessionStorage, sessionStorage.setItem], SbankenStorageKey.CustomerId, customerId);
  });

  yield takeLatest(SbankenActionType.GetTokenRequest, getTokenSaga);
  yield takeLatest(SbankenActionType.GetAccountsRequest, getAccountsSaga);
}
