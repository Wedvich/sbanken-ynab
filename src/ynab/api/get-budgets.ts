import { select, call, put } from 'redux-saga/effects';
import { YnabActionType, YnabState } from '../reducer';
import { RootState } from '../../store/root-reducer';
import { YnabBudget } from '.';
import { ynabApiBaseUrl } from '../../shared/config';

export const getBudgetsRequest = () => ({
  type: YnabActionType.GetBudgetsRequest as YnabActionType.GetBudgetsRequest,
});

export const getBudgetsResponse = (budgets?: YnabBudget[], error?: string) => ({
  type: YnabActionType.GetBudgetsResponse as YnabActionType.GetBudgetsResponse,
  budgets,
  error,
});

export function* getBudgetsSaga() {
  const { personalAccessToken }: YnabState = yield select(
    (state: RootState) => state.ynab
  );
  const response: Response = yield call(fetch, `${ynabApiBaseUrl}/budgets`, {
    headers: new Headers({
      Accept: 'application/json',
      Authorization: `Bearer ${personalAccessToken}`,
    }),
  });

  if (!response.ok) {
    return yield put(getBudgetsResponse(undefined, response.statusText));
  }

  const budgetsResponse = yield call([response, response.json]);
  const { budgets } = budgetsResponse.data;

  yield put(getBudgetsResponse(budgets));
}
