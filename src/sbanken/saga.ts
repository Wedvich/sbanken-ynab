import { takeLatest, put } from 'redux-saga/effects';
import { SbankenActionType, actions } from './reducer';
import { getTokenSaga } from './api/get-token';
import { getAccountsSaga } from './api/get-accounts';

export default function* () {
  yield takeLatest(SbankenActionType.SetCredentials, function* () {
    yield put(actions.getTokenRequest());
  });

  yield takeLatest(SbankenActionType.GetTokenRequest, getTokenSaga);
  yield takeLatest(SbankenActionType.GetAccountsRequest, getAccountsSaga);
}
