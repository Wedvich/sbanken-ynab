import React, { FunctionComponent, useState } from 'react';
import { Provider } from 'react-redux';
import { hot } from 'react-hot-loader/root';
import 'normalize.css';

import store from './store';
import Onboarding from './onboarding';

import './root.scss';

const Root: FunctionComponent = () => {
  const [onboarding, setOnboarding] = useState(true);
  return (
    <Provider store={store}>
      {onboarding && <Onboarding hide={() => setOnboarding(false)} />}
      {!onboarding && <div>
        Not onboarding
        <button onClick={() => setOnboarding(true)}>Settings</button>
      </div>}
    </Provider>
  );
}

export default hot(Root);
