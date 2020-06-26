import { SbankenActionType, SbankenState } from '../reducer';
import { select, call, put } from 'redux-saga/effects';
import { RootState } from '../../store/root-reducer';
import { SbankenTransaction, SbankenTransactionEnriched, patchDate, SbankenTransactionType } from '.';
import { computeTransactionId } from '../utils';
import { TransactionsState } from '../../transactions/reducer';
import { refreshExpiredTokenSaga } from './get-token';
import { sbankenApiBaseUrl } from '../../shared/config';

export const getTransactionsRequest = (accountId: string) => ({
  type: SbankenActionType.GetTransactionsRequest as SbankenActionType.GetTransactionsRequest,
  accountId,
});

export const getTransactionsResponse = (transactions: SbankenTransactionEnriched[]) => ({
  type: SbankenActionType.GetTransactionsResponse as SbankenActionType.GetTransactionsResponse,
  transactions,
});

const enrichTransactions = async (transactions: SbankenTransaction[], accountId: string) => {
  const transactionsWithIds = await Promise.all(transactions.map(async (transaction) => {
    const earliestDate = transaction.interestDate > transaction.accountingDate
      ? transaction.accountingDate
      : transaction.interestDate;
    return {
      ...transaction,
      date: transaction.isReservation == true ? transaction.accountingDate : transaction.cardDetails?.purchaseDate,
      accountId,
      id: transaction.cardDetails?.transactionId
        ?? await computeTransactionId(transaction),
      payee: transaction.isReservation == true ? transaction.text : transaction.text.split(" ").slice(4,-2).join(" "),
    } as SbankenTransactionEnriched;
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
  yield call(refreshExpiredTokenSaga);
  const { token, customerId }: SbankenState = yield select((state: RootState) => state.sbanken);
  const { startDate }: TransactionsState = yield select((state: RootState) => state.transactions);

  const url = [
    `${sbankenApiBaseUrl}/transactions/${accountId}`,
    `?startDate=${startDate}`,
  ];

  const response = yield call(fetch, url.join(''), {
    headers: new Headers({
      'Accept': 'application/json',
      'Authorization': `Bearer ${token.token}`,
      'customerId': customerId,
    }),
  });

  const { items } = yield call([response, response.json]);
  const transactions = yield call(enrichTransactions, items, accountId);

  yield put(getTransactionsResponse(transactions));
}
