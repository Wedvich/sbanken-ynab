import { h } from 'preact';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './app.css';
import { LandingPage } from './pages/landing';
import { MainPage } from './pages/main';
import { ServiceWorkerManager } from './service-worker/manager';
import { Provider } from 'react-redux';
import { store } from './store';
import { useState } from 'preact/hooks';

export const App = () => {
  const [isOnboarded, setIsOnboarded] = useState(false);
  return (
    <Provider store={store}>
      <Router>
        <ServiceWorkerManager />
        <div className="h-screen">
          <Switch>
            {/* <Route path="/onboarding">
              <OnboardingPage />
            </Route> */}
            <Route exact path="/">
              {!isOnboarded ? <LandingPage onNext={() => setIsOnboarded(true)} /> : <MainPage />}
            </Route>
          </Switch>
        </div>
      </Router>
    </Provider>
  );
};
