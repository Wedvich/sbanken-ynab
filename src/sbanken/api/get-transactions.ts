import { SbankenActionType, SbankenState } from '../reducer';
import { select, call, put } from 'redux-saga/effects';
import { RootState } from '../../store/root-reducer';
import { sbankenApiBaseUrl, SbankenTransaction } from '.';

export const getTransactionsRequest = (accountId: string) => ({
  type: SbankenActionType.GetTransactionsRequest as SbankenActionType.GetTransactionsRequest,
  accountId,
});

export const getTransactionsResponse = (transactions: SbankenTransaction[]) => ({
  type: SbankenActionType.GetTransactionsResponse as SbankenActionType.GetTransactionsResponse,
  transactions,
});

// TODO: Typed action
export function* getTransactionsSaga({ accountId }) {
  const { token, customerId }: SbankenState = yield select((state: RootState) => state.sbanken);

  const response = yield call(fetch, `${sbankenApiBaseUrl}/transactions/${accountId}?startDate=2019-12-30`, {
    headers: new Headers({
      'Accept': 'application/json',
      'Authorization': `Bearer ${token.token}`,
      'customerId': customerId,
    }),
  });

  const { items } = yield call([response, response.json]);

  yield put(getTransactionsResponse(items));
}
