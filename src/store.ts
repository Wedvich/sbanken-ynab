import { applyMiddleware, createStore } from 'redux';

const middleware = [];
if (process.env.NODE_ENV === 'development') {
  const { createLogger } = require('redux-logger');
  const logger = createLogger({ collapsed: true });
  middleware.push(logger);
}

const initialState = {
  onboarding: {
    complete: false
  },
};

const rootReducer = (state: any = initialState, action: any) => state;
const store = createStore(rootReducer, undefined, applyMiddleware(...middleware));

export default store;
