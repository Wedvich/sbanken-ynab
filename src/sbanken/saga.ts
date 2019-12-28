import { takeLatest, put, delay } from 'redux-saga/effects';
import { SbankenActionType, actions } from './reducer';

function* getTokenSaga() {
  yield put(actions.getTokenRequest());
  yield delay(1500);
  yield put(actions.getTokenResponse(undefined, 'Oops!'));
}

export default function* () {
  yield takeLatest(SbankenActionType.SetCredentials, getTokenSaga);
}
