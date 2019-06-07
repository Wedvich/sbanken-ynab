import { combineReducers } from 'redux';

import { reducer as sbankenReducer } from '../sbanken';
import { reducer as ynabReducer } from '../ynab';

const rootReducer = combineReducers({
  sbanken: sbankenReducer,
  ynab: ynabReducer,
});

export default rootReducer;
