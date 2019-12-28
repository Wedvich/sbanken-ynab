import { take, all, put } from 'redux-saga/effects';
import { History } from 'history';
import { SbankenActionType, actions as sbankenActions } from '../sbanken/reducer';
import { YnabActionType } from '../ynab/reducer';

export default function* (history: History) {
  history.replace('/onboarding/sbanken');
  const response: ReturnType<typeof sbankenActions.getTokenResponse> = yield take(SbankenActionType.GetTokenResponse);
  if (response.error) return;
  history.replace('/onboarding/ynab');
  yield all([
    take(YnabActionType.SetToken),
    take(YnabActionType.SetBudget),
  ]);
  history.replace('/onboarding/accounts');
  yield put(sbankenActions.getAccountsRequest());
}
