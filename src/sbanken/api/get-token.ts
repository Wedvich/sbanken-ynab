import { SbankenActionType, SbankenState } from '../reducer';
import { SbankenTokenResponse, transformAccessToken, SbankenAccessToken } from '.';
import { select, put, call, take } from 'redux-saga/effects';
import { RootState } from '../../store/root-reducer';
import { storeAccessToken, validateAccessToken } from '../utils';
import { sbankenIdentityServerUrl } from '../../shared/config';

export const getTokenRequest = () => ({
  type: SbankenActionType.GetTokenRequest as SbankenActionType.GetTokenRequest,
});

export const getTokenResponse = (token?: SbankenAccessToken, error?: string) => ({
  type: SbankenActionType.GetTokenResponse as SbankenActionType.GetTokenResponse,
  token,
  error,
});

export function* refreshExpiredTokenSaga() {
  const { token }: SbankenState = yield select((state: RootState) => state.sbanken);
  if (validateAccessToken(token)) return;
  yield put(getTokenRequest());
  yield take(SbankenActionType.GetTokenResponse);
}

export function* getTokenSaga() {
  const { credentials }: SbankenState = yield select((state: RootState) => state.sbanken);
  const tokenRequest: Partial<RequestInit> = {
    method: 'post',
    headers: new Headers({
      'Accept': 'application/json',
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    }),
    body: 'grant_type=client_credentials',
  };

  try {
    const response: Response = yield call(fetch, sbankenIdentityServerUrl, tokenRequest as RequestInit);
    if (!response.ok) {
      return yield put(getTokenResponse(undefined, response.statusText));
    }
    const tokenResponse: SbankenTokenResponse = yield call([response, response.json]);
    const token = transformAccessToken(tokenResponse);
    yield put(getTokenResponse(token));
    yield call(storeAccessToken, token);
  } catch (e) {
    yield put(getTokenResponse(undefined, (e as Error).message));
  }
}
