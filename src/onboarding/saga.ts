import { take, all, put, select } from 'redux-saga/effects';
import { History } from 'history';
import { SbankenActionType, actions as sbankenActions, SbankenState } from '../sbanken/reducer';
import { YnabActionType, actions as ynabActions } from '../ynab/reducer';
import { RootState } from '../store/root-reducer';
import { validateAccessToken } from '../sbanken/utils';

export default function* (history: History) {
  const { token, customerId }: SbankenState = yield select((state: RootState) => state.sbanken);
  if (!validateAccessToken(token) || !customerId) {
    history.replace('/onboarding/sbanken');
    const response: ReturnType<typeof sbankenActions.getTokenResponse> = yield take(SbankenActionType.GetTokenResponse);
    if (response.error) return;
  }

  history.replace('/onboarding/ynab');
  yield all([
    take(YnabActionType.SetToken),
    take(YnabActionType.SetBudget),
  ]);
  history.replace('/onboarding/accounts');
  yield all([
    put(sbankenActions.getAccountsRequest()),
    put(ynabActions.getAccountsRequest()),
  ]);
}
