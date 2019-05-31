import React, { FunctionComponent } from 'react';
import { applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import { hot } from 'react-hot-loader/root';

const middleware = [];
if (process.env.NODE_ENV === 'development') {
  const { createLogger } = require('redux-logger');
  const logger = createLogger({ collapsed: true });
  middleware.push(logger);
}

const rootReducer = (state: any = {}, action: any) => state;
const store = createStore(rootReducer, undefined, applyMiddleware(...middleware));

const Root: FunctionComponent = () => (
  <Provider store={store}>
    <div>hello</div>
  </Provider>
);

export default hot(Root);
