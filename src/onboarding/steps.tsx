import React from 'react';
import { useLocation } from 'react-router-dom';
import cx from 'classnames';

const OnboardingSteps = () => {
  const location = useLocation();

  return (
    <div className="steps">
      <div className={cx('step', { active: location.pathname === '/onboarding/sbanken' })} />
      <div className={cx('step', { active: location.pathname === '/onboarding/ynab' })} />
      <div className={cx('step', { active: location.pathname === '/onboarding/ynab/budget' })} />
    </div>
  );
};

export default React.memo(OnboardingSteps);
