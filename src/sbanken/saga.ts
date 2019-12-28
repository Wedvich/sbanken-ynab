import { takeLatest, put, call } from 'redux-saga/effects';
import { SbankenActionType, actions } from './reducer';
import { getTokenSaga } from './api/get-token';
import { getAccountsSaga } from './api/get-accounts';
import { storeCustomerId, storeCredentials } from './utils';

export default function* () {
  yield takeLatest(SbankenActionType.SetCredentials, function* ({ credentials, customerId }: any) {
    yield put(actions.getTokenRequest());
    yield call(storeCredentials, credentials);
    yield call(storeCustomerId, customerId);
  });

  yield takeLatest(SbankenActionType.GetTokenRequest, getTokenSaga);
  yield takeLatest(SbankenActionType.GetAccountsRequest, getAccountsSaga);
}
