import React from 'react';
import { hot } from 'react-hot-loader/root';
import { Switch, Route, Redirect } from 'react-router-dom';
import Onboarding from '../onboarding';
import Accounts from '../accounts';
import './root.scss';

const Root = () => (
  <div className="sby-root">
    <Switch>
      <Route path="/onboarding">
        <Onboarding />
      </Route>
      <Route path="/accounts/:accountId?">
        <Accounts />
      </Route>
      <Route exact path="/">
        <Redirect to="/accounts" />
      </Route>
    </Switch>
  </div>
);

export default hot(Root);
