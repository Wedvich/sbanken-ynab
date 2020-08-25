import { take, all, put, select, call } from 'redux-saga/effects';
import { History } from 'history';
import { SbankenActionType, actions as sbankenActions, SbankenState } from '../sbanken/reducer';
import { YnabActionType, actions as ynabActions, YnabState } from '../ynab/reducer';
import { RootState } from '../store/root-reducer';
import { validateAccessToken } from '../sbanken/utils';
import { getStoredOnboardingStatus, OnboardingActionType, storeOnboardingStatus, OnboardingStatus } from './utils';
import { getBudgetsResponse } from '../ynab/api/get-budgets';

export default function* (history: History) {
  const onboardingStatus: OnboardingStatus = yield call(getStoredOnboardingStatus);
  if (onboardingStatus === OnboardingStatus.NotStarted) {
    history.replace('/onboarding/intro');
    yield take(OnboardingActionType.Seen);
    yield call(storeOnboardingStatus, OnboardingStatus.Started);
  }

  const { token: sbankenToken, customerId }: SbankenState =
    yield select((state: RootState) => state.sbanken);

  if (!validateAccessToken(sbankenToken) || !customerId) {
    // If the onboarding has been completed before, we can skip the onboarding screen
    // and request a new token using the existing credentials.
    if (onboardingStatus === OnboardingStatus.Completed) {
      yield put(sbankenActions.getTokenRequest());
    } else {
      history.replace('/onboarding/sbanken');
    }

    // If the token retrieval fails for any reason, there's no point in continuing.
    const { error } = yield take(SbankenActionType.GetTokenResponse);
    if (error) {
      return;
    }
  }

  const { personalAccessToken: ynabToken, budgetId }: YnabState =
    yield select((state: RootState) => state.ynab);

  if (!ynabToken || !budgetId) {
    history.push('/onboarding/ynab');
    if (ynabToken) {
      yield put(ynabActions.getBudgetsRequest());
    }

    let validYnabToken = false;
    while (!validYnabToken) {
      console.count('while (!validYnabToken)');
      const budgetsResponse: ReturnType<typeof getBudgetsResponse> =
        yield take(YnabActionType.GetBudgetsResponse);

      console.log('response', budgetsResponse);

      if (budgetsResponse.error) {
        yield take(YnabActionType.SetToken);
      } else {
        validYnabToken = true;
        console.log('validYnabToken = true');
      }
    }

    console.log('history.replace(\'/onboarding/ynab/budget\')');
    history.replace('/onboarding/ynab/budget');
    yield take(YnabActionType.SetBudget);
  }

  if (onboardingStatus !== OnboardingStatus.Completed) {
    yield call(storeOnboardingStatus, OnboardingStatus.Completed);
  }
  history.replace('/');
  yield all([
    put(sbankenActions.getAccountsRequest()),
    put(ynabActions.getAccountsRequest()),
  ]);
}
