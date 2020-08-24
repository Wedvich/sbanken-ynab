import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Onboarding from '../onboarding';
import Accounts from '../accounts';
import icons from '../shared/icon/icons.svg';
import Modals from '../modals';
import OfflineBanner from '../shared/offline-banner';

import 'normalize.css/normalize.css';
import './app.scss';

const App = () => (
  <div className="sby-app">
    <div hidden dangerouslySetInnerHTML={{ __html: icons }} />
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
    <OfflineBanner />
    <Modals />
  </div>
);

export default App;
