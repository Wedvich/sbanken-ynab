import { SbankenActionType, SbankenState } from '../reducer';
import { select, call, put } from 'redux-saga/effects';
import { RootState } from '../../store/root-reducer';
import { sbankenApiBaseUrl, SbankenTransaction, SbankenTransactionWithId } from '.';
import { computeTransactionId } from '../utils';

export const getTransactionsRequest = (accountId: string) => ({
  type: SbankenActionType.GetTransactionsRequest as SbankenActionType.GetTransactionsRequest,
  accountId,
});

export const getTransactionsResponse = (transactions: SbankenTransactionWithId[]) => ({
  type: SbankenActionType.GetTransactionsResponse as SbankenActionType.GetTransactionsResponse,
  transactions,
});

const computeTransactionIds = async (transactions: SbankenTransaction[]) => {
  const transactionsWithIds = await Promise.all(transactions.map(async (transaction) => {
    return {
      ...transaction,
      id: await computeTransactionId(transaction),
    } as SbankenTransactionWithId;
  }));

  const idCounts = (transactionsWithIds.reduce((counts, transaction, i) => {
    counts[transaction.id] = (counts[transaction.id] ?? []).concat([i]);
    return counts;
  }, {}));

  Object.keys(idCounts).forEach((key) => {
    const indexes = idCounts[key] as number[];
    if (indexes.length <= 1) return;

    indexes.forEach((index, i) => {
      transactionsWithIds[index].id += `-${i}`;
    });
  });

  return transactionsWithIds;
};

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
  const transactions = yield call(computeTransactionIds, items);

  yield put(getTransactionsResponse(transactions));
}
