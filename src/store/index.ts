import { createStore, compose as reduxCompose, Middleware, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import immutableStateInvariantMiddleware from 'redux-immutable-state-invariant';
import { History } from 'history';
import rootReducer from './root-reducer';
import rootSaga from './root-saga';

const compose =
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?.({ trace: true }) || reduxCompose;

export default (history: History) => {
  const middlewares: Middleware[] = [];
  if (process.env.NODE_ENV === 'development') {
    middlewares.push(immutableStateInvariantMiddleware());
  }

  const sagaMiddleware = createSagaMiddleware();
  middlewares.push(sagaMiddleware);

  const enhancer = compose(applyMiddleware(...middlewares));
  const store = createStore(rootReducer, enhancer);

  sagaMiddleware.run(rootSaga, history);
  return store;
};
