import { call, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';

import { GetSbankenTokenRequestAction, actions, SbankenActionTypes } from './actions';

const SBANKEN_STS_URL = 'https://auth.sbanken.no/identityserver/connect/token';

function* getSbankenTokenSaga(action: GetSbankenTokenRequestAction) {
  try {
    const response = yield call(axios.post, SBANKEN_STS_URL, 'grant_type=client_credentials', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${action.credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const tokenExpiry = new Date().getTime() + response.data.expires_in;
    yield put(actions.getSbankenTokenSuccess(response.data.access_token, tokenExpiry));
  } catch (e) {
    yield put(actions.getSbankenTokenFailure(e));
  }
}

export function* saga() {
  yield takeLatest(SbankenActionTypes.GetTokenRequest, getSbankenTokenSaga);
}
