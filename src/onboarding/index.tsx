import React, {  } from 'react';
import { Switch, Route } from 'react-router-dom';
import SbankenOnboarding from './sbanken';
import YnabOnboarding from './ynab';
import Intro from './intro';

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
      <Route>
        <Intro />
      </Route>
    </Switch>
  );
};

export default Onboarding;
