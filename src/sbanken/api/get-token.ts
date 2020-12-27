import { SbankenActionType, SbankenState } from '../reducer';
import { SbankenTokenResponse, transformAccessToken, SbankenAccessToken } from '.';
import { select, put, call, take } from 'redux-saga/effects';
import { RootState } from '../../store/root-reducer';
import { storeAccessToken, validateAccessToken } from '../utils';
import { sbankenIdentityServerUrl } from '../../shared/config';
import { HttpError, HttpErrorSource } from '../../shared/utils';

export const getTokenRequest = () => ({
  type: SbankenActionType.GetTokenRequest as SbankenActionType.GetTokenRequest,
});

export const getTokenResponse = (token?: SbankenAccessToken, error?: HttpError) => ({
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
      Accept: 'application/json',
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    }),
    body: 'grant_type=client_credentials',
  };

  try {
    const response: Response = yield call(
      fetch,
      sbankenIdentityServerUrl,
      tokenRequest as RequestInit
    );

    if (!response.ok) {
      const error: HttpError = {
        source: HttpErrorSource.SbankenApi,
        statusCode: response.status,
        statusText: response.statusText,
      };

      return yield put(getTokenResponse(undefined, error));
    }

    const tokenResponse: SbankenTokenResponse = yield call([response, response.json]);
    const token = transformAccessToken(tokenResponse);
    yield put(getTokenResponse(token));
    yield call(storeAccessToken, token);
  } catch (e) {
    const error: HttpError = {
      source: HttpErrorSource.SbankenApi,
      statusCode: 0,
      statusText: (e as Error).message,
    };
    yield put(getTokenResponse(undefined, error));
  }
}
