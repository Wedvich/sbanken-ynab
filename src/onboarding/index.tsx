import React, {  } from 'react';
import './onboarding.scss';
import { Switch, Route } from 'react-router-dom';
import SbankenOnboarding from './sbanken';
import YnabOnboarding from './ynab';
import AccountsOnboarding from './accounts';

const Onboarding = () => {
  return (
    <Switch>
      <Route path="/onboarding/sbanken">
        <SbankenOnboarding />
      </Route>
      <Route path="/onboarding/ynab">
        <YnabOnboarding />
      </Route>
      <Route path="/onboarding/accounts">
        <AccountsOnboarding />
      </Route>
    </Switch>
  );
};

export default Onboarding;
