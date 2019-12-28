import { SbankenActionType, SbankenState } from '../reducer';
import { SbankenTokenResponse, transformAccessToken } from '.';
import { select, put, call } from 'redux-saga/effects';
import { RootState } from '../../store/root-reducer';
import { storeAccessToken } from '../utils';

export const getTokenRequest = () => ({
  type: SbankenActionType.GetTokenRequest as SbankenActionType.GetTokenRequest,
});

export const getTokenResponse = (response?: SbankenTokenResponse, error?: string) => ({
  type: SbankenActionType.GetTokenResponse as SbankenActionType.GetTokenResponse,
  response,
  error,
});

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
    const response: Response = yield call(fetch, 'https://auth.sbanken.no/identityserver/connect/token', tokenRequest as RequestInit);
    if (!response.ok) {
      return yield put(getTokenResponse(undefined, response.statusText));
    }
    const tokenResponse: SbankenTokenResponse = yield call([response, response.json]);
    yield put(getTokenResponse(tokenResponse));
    yield call(storeAccessToken, transformAccessToken(tokenResponse));
  } catch (e) {
    yield put(getTokenResponse(undefined, (e as Error).message));
  }
}
