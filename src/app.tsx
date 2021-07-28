import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { CACHE_KEY_PREFIX, ServiceWorkerActionTypes } from './service-worker/constants';
import './app.css';
import { LandingPage } from './pages/landing';
import { OnboardingPage } from './pages/onboarding';
import { Route, Switch } from 'react-router-dom';

export const App = () => {
  const [updatedWorker, setUpdatedWorker] = useState<ServiceWorker>(undefined);

  useEffect(() => {
    const trackInstalling = (worker: ServiceWorker) => {
      worker.addEventListener('statechange', () => {
        if (worker.state == 'installed') {
          setUpdatedWorker(worker);
        }
      });
    };

    if (process.env.NODE_ENV !== 'production' || location.search.endsWith('no-sw')) {
      navigator.serviceWorker?.getRegistration('/sw.js').then(async (registration) => {
        if (registration) {
          await registration.unregister();
          window.location.reload();
        }

        return caches
          .keys()
          .then((cacheNames) =>
            Promise.all(
              cacheNames
                .filter((cacheName) => cacheName.startsWith(CACHE_KEY_PREFIX))
                .map((cacheName) => caches.delete(cacheName))
            )
          );
      });
    } else if (navigator.serviceWorker) {
      void navigator.serviceWorker.register('/sw.js').then((registration) => {
        if (!navigator.serviceWorker.controller) {
          return;
        }

        if (registration.waiting) {
          setUpdatedWorker(registration.waiting);
          return;
        }

        if (registration.installing) {
          trackInstalling(registration.installing);
          return;
        }

        registration.addEventListener('updatefound', () => {
          trackInstalling(registration.installing);
        });
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  useEffect(() => {
    if (!updatedWorker) return;

    if (confirm('En ny versjon av Sbanken → YNAB er tilgjengelig. Vil du laste den inn nå?')) {
      updatedWorker?.postMessage({ type: ServiceWorkerActionTypes.ApplyUpdate });
      setUpdatedWorker(undefined);
    }
  }, [updatedWorker]);

  return (
    <div className="h-full">
      <Switch>
        <Route path="/onboarding">
          <OnboardingPage />
        </Route>
        <Route path="/">
          <LandingPage />
        </Route>
      </Switch>
    </div>
  );
};
