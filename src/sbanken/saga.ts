import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import axios from 'axios';

import { GetSbankenTokenRequestAction, actions, SbankenActionTypes, GetSbankenTokenSuccessAction } from './actions';

const SBANKEN_STS_URL = 'https://auth.sbanken.no/identityserver/connect/token';
const SBANKEN_CACHED_CREDENTIALS_KEY = 'sbanken-credentials';

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

function* storeSbankenCredentialsSaga() {
  const { credentials, customerId }: { credentials: string; customerId: string; } =
    yield select(s => s.authentication.sbanken);
  localStorage.setItem(SBANKEN_CACHED_CREDENTIALS_KEY, JSON.stringify({
    credentials,
    customerId,
  }));
}

function* loadSbankenCachedCredentialsSaga() {
  try {
    const cachedCredentials = localStorage.getItem(SBANKEN_CACHED_CREDENTIALS_KEY);
    if (!cachedCredentials) return; 
    const { credentials, customerId }: { credentials: string; customerId: string; } = JSON.parse(cachedCredentials);
    yield put(actions.loadSbankenCachedCredentialsSuccess(credentials, customerId));
  } catch (e) {
    localStorage.removeItem(SBANKEN_CACHED_CREDENTIALS_KEY);
  }
}

export function* saga() {
  yield takeLatest(SbankenActionTypes.GetTokenRequest, getSbankenTokenSaga);
  yield takeEvery(SbankenActionTypes.GetTokenSuccess, storeSbankenCredentialsSaga);
  yield takeEvery(SbankenActionTypes.LoadCachedCredentials, loadSbankenCachedCredentialsSaga);

  yield put(actions.loadSbankenCachedCredentials());
}
