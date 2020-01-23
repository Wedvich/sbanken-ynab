import { Reducer } from 'redux';
import { DateTime } from 'luxon';
import { formatDate } from '../localization';

export const transactionsStateKey = 'transactions';

const initialState = {
  startDate: formatDate(DateTime.local().minus({ days: 7 })),
};

export type TransactionsState = typeof initialState;

const reducer: Reducer<TransactionsState> = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default reducer;
