import { select, call, put } from 'redux-saga/effects';
import { YnabActionType, YnabState } from '../reducer';
import { RootState } from '../../store/root-reducer';
import { ynabApiBaseUrl, YnabBudget } from '.';

export const getBudgetsRequest = () => ({
  type: YnabActionType.GetBudgetsRequest as YnabActionType.GetBudgetsRequest,
});

export const getBudgetsResponse = (budgets: YnabBudget[]) => ({
  type: YnabActionType.GetBudgetsResponse as YnabActionType.GetBudgetsResponse,
  budgets,
});

export function* getBudgetsSaga() {
  const { personalAccessToken }: YnabState = yield select((state: RootState) => state.ynab);
  const response = yield call(
    fetch,
    `${ynabApiBaseUrl}/budgets`,
    {
      headers: new Headers({
        'Accept': 'application/json',
        'Authorization': `Bearer ${personalAccessToken}`,
      }),
    }
  );

  const budgetsResponse = yield call([response, response.json]);
  const { budgets } = budgetsResponse.data;

  yield put(getBudgetsResponse(budgets));
}
