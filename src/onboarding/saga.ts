import { take, all, put, select } from 'redux-saga/effects';
import { History } from 'history';
import { SbankenActionType, actions as sbankenActions, SbankenState } from '../sbanken/reducer';
import { YnabActionType, actions as ynabActions, YnabState } from '../ynab/reducer';
import { RootState } from '../store/root-reducer';
import { validateAccessToken } from '../sbanken/utils';

export default function* (history: History) {
  const { token: sbankenToken, customerId }: SbankenState = yield select((state: RootState) => state.sbanken);
  if (!validateAccessToken(sbankenToken) || !customerId) {
    history.replace('/onboarding/sbanken');
    const response: ReturnType<typeof sbankenActions.getTokenResponse> = yield take(SbankenActionType.GetTokenResponse);
    if (response.error) return;
  }

  const { personalAccessToken: ynabToken, budgetId }: YnabState = yield select((state: RootState) => state.ynab);
  if (!ynabToken || !budgetId) {
    history.replace('/onboarding/ynab');
    yield all([
      take(YnabActionType.SetToken),
      take(YnabActionType.SetBudget),
    ]);
  }

  history.replace('/');
  yield all([
    put(sbankenActions.getAccountsRequest()),
    put(ynabActions.getAccountsRequest()),
  ]);
}
