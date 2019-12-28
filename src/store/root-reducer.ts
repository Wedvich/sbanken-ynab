import { combineReducers } from 'redux';
import sbankenReducer, { sbankenStateKey } from '../sbanken/reducer';
import * as utils from '../shared/utils';

let reducerMap = {
  [sbankenStateKey]: sbankenReducer,
};

let rootReducer = combineReducers(reducerMap);

export type RootState = ReturnType<typeof rootReducer>

if (process.env.NODE_ENV === 'development') {
  reducerMap = utils.sortObject(reducerMap);
  const unsortedRootReducer = combineReducers(reducerMap);
  rootReducer = ((state, action) => utils.sortObject(unsortedRootReducer(state, action)));
}

export default rootReducer;
