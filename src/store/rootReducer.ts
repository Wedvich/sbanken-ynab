import { combineReducers } from 'redux';

import { reducer as sbankenReducer } from '../sbanken';

const authenticationReducer = combineReducers({
  sbanken: sbankenReducer,
})

export default combineReducers({
  authentication: authenticationReducer,
});
