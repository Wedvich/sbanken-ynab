import { Reducer } from 'redux';

export const accountsStateKey = 'accounts';

const initialState = {

};

export type AccountsState = typeof initialState;

const reducer: Reducer<AccountsState> = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default reducer;
