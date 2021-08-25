import { h } from 'preact';
import './app.css';
import { LandingPage } from './pages/landing';
import { OnboardingPage } from './pages/onboarding';
import { Route, Switch } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { validateSbankenToken } from './services/sbanken';
import { MainPage } from './pages/main';
import type { RootState } from './services';

export const App = () => {
  const sbankenCredentials = useSelector((state: RootState) => state.sbanken.credentials);
  const ynabTokens = useSelector((state: RootState) => state.ynab.tokens);

  const hasAnyValidSbankenToken = sbankenCredentials.some((credential) =>
    validateSbankenToken(credential.token)
  );

  const hasValidConfiguration = hasAnyValidSbankenToken && ynabTokens[0];

  return (
    <div className="h-full">
      {/* <Modal isOpen={isOpen} onCancel={() => setIsOpen(false)} onConfirm={() => setIsOpen(false)} /> */}
      <Switch>
        <Route path="/onboarding">
          <OnboardingPage />
        </Route>
        <Route path="/">{!hasValidConfiguration ? <LandingPage /> : <MainPage />}</Route>
      </Switch>
    </div>
  );
};
