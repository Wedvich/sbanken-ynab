import React, {  } from 'react';
import './onboarding.scss';
import { Switch, Route } from 'react-router-dom';
import SbankenOnboarding from './sbanken';
import YnabOnboarding from './ynab';

const Onboarding = () => {
  return (
    <Switch>
      <Route path="/onboarding/sbanken">
        <SbankenOnboarding />
      </Route>
      <Route path="/onboarding/ynab">
        <YnabOnboarding />
      </Route>
    </Switch>
  );
};

export default Onboarding;
