import React, { FunctionComponent } from 'react';
import { Provider } from 'react-redux';
import { hot } from 'react-hot-loader/root';
import { MemoryRouter, Route } from 'react-router';

import store from './store';
import Onboarding from './onboarding/onboarding';

const Root: FunctionComponent = () => (
  <Provider store={store}>
    <MemoryRouter>
      <Route path="/">
        <Onboarding />
      </Route>
    </MemoryRouter>
  </Provider>
);

export default hot(Root);
