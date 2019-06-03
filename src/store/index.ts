import { applyMiddleware, createStore, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';

import rootReducer from './rootReducer';
import rootSaga from './rootSaga';
import { api as sbankenApi } from '../sbanken';
import { api as ynabApi } from '../ynab';

const sagaMiddleware = createSagaMiddleware();
const middleware = [sagaMiddleware];

if (process.env.NODE_ENV === 'development') {
  const { createLogger } = require('redux-logger');
  const logger = createLogger({ collapsed: true });
  middleware.push(logger);
}

const store = createStore(rootReducer, undefined, composeWithDevTools(
  applyMiddleware(...middleware)
));

sbankenApi.connect(store);
ynabApi.connect(store);

sagaMiddleware.run(rootSaga);

export default store;
