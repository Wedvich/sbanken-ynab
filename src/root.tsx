import React, { FunctionComponent, useState } from 'react';
import { Provider } from 'react-redux';
import { hot } from 'react-hot-loader/root';
import 'normalize.css';

import './root.scss';

import store from './store';
import Onboarding from './onboarding';
import Button from './components/button';

const Root: FunctionComponent = () => {
  const [onboarding, setOnboarding] = useState(true);
  return (
    <Provider store={store}>
      {onboarding && <Onboarding hide={() => setOnboarding(false)} />}
      {!onboarding && <div>
        <Button onClick={() => setOnboarding(true)}>Settings</Button>
      </div>}
    </Provider>
  );
}

export default hot(Root);
