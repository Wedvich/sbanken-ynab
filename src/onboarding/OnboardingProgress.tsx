import React, { FunctionComponent } from 'react';

import './style.scss';

const OnboardingProgress: FunctionComponent = () => (
  <div className="onboarding__progress">
    <u>Sbanken step</u>
    &nbsp;→&nbsp;
    <span>YNAB step</span>
    &nbsp;→&nbsp;
    <span>Config step</span>
  </div>
);

export default OnboardingProgress;
