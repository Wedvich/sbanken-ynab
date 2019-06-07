import React, { FunctionComponent } from 'react';
import { Provider } from 'react-redux';
import { hot } from 'react-hot-loader/root';
import 'normalize.css';

import store from './store';
import Onboarding from './onboarding';

import './root.scss';

const Root: FunctionComponent = () => (
  <Provider store={store}>
    <Onboarding />
  </Provider>
);

export default hot(Root);
