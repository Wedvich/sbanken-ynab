import React, { FunctionComponent } from 'react';
import { Provider } from 'react-redux';
import { hot } from 'react-hot-loader/root';
import { Redirect, Route, Switch, match as Match } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import 'normalize.css';

import './root.scss';

import store from './store';
import Header from './header';
import Settings from './settings';

const FourOhFour = () => <div>404</div>;
const App = () => <div>App</div>;
const Onboarding = ({ match }: { match: Match }) => (
  <div>
    Onboarding
    <Redirect exact from={`${match.url}`} to={`${match.url}/sbanken`} />
    <Route
      path={`${match.url}/sbanken`}
      component={() => (
        <div>
          <span className="shared">Shared</span>
          &nbsp;
          <span className="members">Members</span>
        </div>
      )}
    />
  </div>
);

const Root: FunctionComponent = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Route component={Header} />
        <Switch>
          <Route exact path="/" component={App} />
          <Redirect from="/login" to="/onboarding" />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/settings" component={Settings} />
          <Route component={FourOhFour} />
        </Switch>
      </BrowserRouter>
      {/* <header className="header">
        <Button onClick={() => setOnboarding(true)}>Innstillinger</Button>
      </header>
      {onboarding && <Onboarding hide={() => setOnboarding(false)} />} */}
    </Provider>
  );
};

export default hot(Root);
