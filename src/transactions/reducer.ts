import { Reducer } from 'redux';

export const transactionsStateKey = 'transactions';

const initialState = {
  startDate: '2019-12-30',
};

export type TransactionsState = typeof initialState;

const reducer: Reducer<TransactionsState> = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default reducer;
