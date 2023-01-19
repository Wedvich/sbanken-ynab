import { Dialog } from '@headlessui/react';
import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Button from '../components/button';
import { CACHE_KEY_PREFIX, ServiceWorkerActionTypes } from './constants';

export default function ServiceWorkerManager() {
  const [updatedWorker, setUpdatedWorker] = useState<ServiceWorker | undefined>();
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    const trackInstalling = (worker: ServiceWorker) => {
      worker.addEventListener('statechange', () => {
        if (worker.state == 'installed') {
          setUpdatedWorker(worker);
        }
      });
    };

    if (process.env.NODE_ENV !== 'production' || location.search.endsWith('no-sw')) {
      void navigator.serviceWorker?.getRegistration().then(async (registration) => {
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
          registration.installing && trackInstalling(registration.installing);
        });
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  useEffect(() => {
    if (!updatedWorker) return;

    setShowUpdatePrompt(true);
  }, [updatedWorker]);

  const applyUpdate = () => {
    updatedWorker?.postMessage({ type: ServiceWorkerActionTypes.ApplyUpdate });
    setUpdatedWorker(undefined);
  };

  return (
    <Dialog
      open={showUpdatePrompt}
      onClose={() => setShowUpdatePrompt(false)}
      className="relative z-10"
    >
      <div className="fixed inset-0 bg-black bg-opacity-25" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center">
          <Dialog.Panel className="bg-white p-8 sm:rounded-lg shadow-2xl">
            <Dialog.Title className="text-lg font-semibold">Ny versjon tilgjengelig</Dialog.Title>
            <Dialog.Description className="mt-4">
              <p>En ny versjon av Sbanken → YNAB er tilgjengelig. Vil du laste den inn nå?</p>
              <p>Hvis ikke vil den lastes inn automatisk neste gang du bruker Sbanken → YNAB.</p>
            </Dialog.Description>
            <div className="mt-4 space-x-4">
              <Button onClick={applyUpdate} importance="primary">
                Ja
              </Button>
              <Button onClick={() => setShowUpdatePrompt(false)}>Nei</Button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
