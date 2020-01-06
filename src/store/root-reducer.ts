import { combineReducers } from 'redux';
import sbankenReducer, { sbankenStateKey } from '../sbanken/reducer';
import ynabReducer, { ynabStateKey } from '../ynab/reducer';
import * as utils from '../shared/utils';
import accountsReducer, { accountsStateKey } from '../accounts/reducer';
import transactionsReducer, { transactionsStateKey } from '../transactions/reducer';
import modalsReducer, { modalsStateKey } from '../modals/reducer';

let reducerMap = {
  [accountsStateKey]: accountsReducer,
  [modalsStateKey]: modalsReducer,
  [sbankenStateKey]: sbankenReducer,
  [transactionsStateKey]: transactionsReducer,
  [ynabStateKey]: ynabReducer,
};

let rootReducer = combineReducers(reducerMap);

export type RootState = ReturnType<typeof rootReducer>

if (process.env.NODE_ENV === 'development') {
  reducerMap = utils.sortObject(reducerMap);
  const unsortedRootReducer = combineReducers(reducerMap);
  rootReducer = ((state, action) => utils.sortObject(unsortedRootReducer(state, action)));
}

export default rootReducer;
