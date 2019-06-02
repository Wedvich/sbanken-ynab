import { applyMiddleware, createStore, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { spawn } from 'redux-saga/effects';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';

import {
  actions as sbankenActions,
  api as sbankenApi,
  reducer as sbankenReducer,
  saga as sbankenSaga,
} from './sbanken';

import {
  api as ynabApi,
} from './ynab';

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

sbankenApi.connect(store);
ynabApi.connect(store);

const rootSaga = function* () {
  yield spawn(sbankenSaga);
};

sagaMiddleware.run(rootSaga);

store.dispatch(sbankenActions.loadSbankenCachedCredentials());

export default store;
