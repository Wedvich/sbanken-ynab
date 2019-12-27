import React from 'react';
import { hot } from 'react-hot-loader/root';
import { Switch, Route } from 'react-router-dom';
import Onboarding from '../onboarding';
import './root.scss';

const Root = () => (
  <div className="sby-root">
    <Switch>
      <Route>
        <Onboarding />
      </Route>
    </Switch>
  </div>
);

export default hot(Root);
