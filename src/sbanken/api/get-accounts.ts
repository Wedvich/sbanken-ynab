import { put, call, select } from 'redux-saga/effects';
import { SbankenActionType, SbankenState } from '../reducer';
import { RootState } from '../../store/root-reducer';
import { SbankenAccount } from '.';
import { refreshExpiredTokenSaga } from './get-token';
import { sbankenApiBaseUrl } from '../../shared/config';

export const getAccountsRequest = () => ({
  type: SbankenActionType.GetAccountsRequest as SbankenActionType.GetAccountsRequest,
});

export const getAccountsResponse = (accounts: SbankenAccount[]) => ({
  type: SbankenActionType.GetAccountsResponse as SbankenActionType.GetAccountsResponse,
  accounts,
});

export function* getAccountsSaga() {
  yield call(refreshExpiredTokenSaga);
  const { token, customerId }: SbankenState = yield select((state: RootState) => state.sbanken);

  const response = yield call(fetch, `${sbankenApiBaseUrl}/accounts`, {
    headers: new Headers({
      Accept: 'application/json',
      Authorization: `Bearer ${token.token}`,
      customerId: customerId,
    }),
  });

  const accountsResponse = yield call([response, response.json]);

  yield put(getAccountsResponse(accountsResponse.items));
}
