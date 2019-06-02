import { applyMiddleware, createStore, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { spawn } from 'redux-saga/effects';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';

import {
  connect as connectSbankenApi,
  reducer as sbankenReducer,
  saga as sbankenSaga
} from './sbanken';

const sagaMiddleware = createSagaMiddleware();
const middleware = [sagaMiddleware];

if (process.env.NODE_ENV === 'development') {
  const { createLogger } = require('redux-logger');
  const logger = createLogger({ collapsed: true });
  middleware.push(logger);
}

const authenticationReducer = combineReducers({
  sbanken: sbankenReducer,
})

const rootReducer = combineReducers({
  authentication: authenticationReducer,
});

const store = createStore(rootReducer, undefined, composeWithDevTools(
  applyMiddleware(...middleware)
));

connectSbankenApi(store);

const rootSaga = function* () {
  yield spawn(sbankenSaga);
};

sagaMiddleware.run(rootSaga);

export default store;
