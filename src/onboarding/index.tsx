import React from 'react';
import { Switch, Route } from 'react-router-dom';
import SbankenOnboarding from './sbanken';
import YnabOnboarding from './ynab';
import OnboardingIntro from './intro';
import ExternalLink from '../shared/external-link';

import './onboarding.scss';

const Onboarding = () => {
  return (
    <>
      <Switch>
        <Route path="/onboarding/sbanken">
          <SbankenOnboarding />
        </Route>
        <Route path="/onboarding/ynab">
          <YnabOnboarding />
        </Route>
        <Route>
          <OnboardingIntro />
        </Route>
      </Switch>
      <footer className="sby-onboarding-footer">
        Ikoner av
        <ExternalLink href="https://www.flaticon.com/authors/freepik" noIcon>
          Freepik
        </ExternalLink>
        fra
        <ExternalLink href="https://www.flaticon.com" noIcon>
          www.flaticon.com
        </ExternalLink>
      </footer>
    </>
  );
};

export default Onboarding;
