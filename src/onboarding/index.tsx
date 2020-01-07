import React, {  } from 'react';
import { Switch, Route } from 'react-router-dom';
import SbankenOnboarding from './sbanken';
import YnabOnboarding from './ynab';

import './onboarding.scss';

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
