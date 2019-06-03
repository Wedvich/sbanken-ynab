import React, { FunctionComponent } from 'react';
import { Provider } from 'react-redux';
import { hot } from 'react-hot-loader/root';
import { Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import store from './store';
import Onboarding from './onboarding/onboarding';

const Root: FunctionComponent = () => (
  <Provider store={store}>
    <BrowserRouter>
      <Route path="/">
        <Onboarding />
      </Route>
    </BrowserRouter>
  </Provider>
);

export default hot(Root);
