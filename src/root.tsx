import React, { FunctionComponent } from 'react';
import { Provider } from 'react-redux';
import { hot } from 'react-hot-loader/root';

import store from './store';

import { actionTypes } from './api/sbanken';
import Onboarding from './onboarding/onboarding';

store.dispatch({ type: actionTypes.GET_TOKEN_REQUEST });

const Root: FunctionComponent = () => (
  <Provider store={store}>
    <Onboarding />
  </Provider>
);

export default hot(Root);
