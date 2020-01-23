import { takeEvery, select, call } from 'redux-saga/effects';
import { History } from 'history';
import { AccountsActionType } from './reducer';
import { RootState } from '../store/root-reducer';
import { storeAccountSources } from './utils';
import accountsSelector from './selectors/accounts';
import { ConnectedAccount } from './types';

export default function* (history: History) {
  yield takeEvery(Object.values(AccountsActionType), function* ({ type }) {
    const state: RootState = yield select();
    const { accounts: connectedAccountSources } = state;
    const connectedAccounts: ConnectedAccount[] = yield call(accountsSelector, state);
    yield call(storeAccountSources, connectedAccountSources);
    if (type === AccountsActionType.Add && connectedAccounts[connectedAccounts.length - 1]) {
      yield call([history, history.push], `/accounts/${connectedAccounts[connectedAccounts.length - 1].compoundId}` as any);
    } else if (type === AccountsActionType.Remove) {
      yield call([history, history.replace], '/accounts' as any);
    }
  });
}
