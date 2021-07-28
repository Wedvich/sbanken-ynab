import { h } from 'preact';
import './app.css';
import { LandingPage } from './pages/landing';
import { OnboardingPage } from './pages/onboarding';
import { Route, Switch } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './services';
import { validateSbankenToken } from './services/sbanken';
import { MainPage } from './pages/main';

export const App = () => {
  const sbankenCredentials = useSelector((state: RootState) => state.sbanken.credentials);
  const ynabTokens = useSelector((state: RootState) => state.ynab.tokens);

  const hasValidConfiguration = validateSbankenToken(sbankenCredentials[0]?.token) && ynabTokens[0];

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
