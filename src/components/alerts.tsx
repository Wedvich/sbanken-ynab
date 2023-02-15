import { h } from 'preact';
import { Transition } from '@headlessui/react';
import Icons from './icons';
import { useMatch, useNavigate } from 'react-router-dom';
import Button from './button';
import { useSelector } from 'react-redux';
import { dismissAlert, selectAlerts } from '../services/alerts';
import { useAppDispatch } from '../services';

export const Alerts = () => {
  const alerts = useSelector(selectAlerts);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isSettingsPage = useMatch('/innstillinger');

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 lg:items-start lg:p-6"
    >
      <Transition
        show={alerts.length > 0}
        as="div"
        className="flex w-full flex-col items-center space-y-4 lg:items-end"
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 lg:translate-y-0 lg:translate-x-2"
        enterTo="translate-y-0 opacity-100 lg:translate-x-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="pointer-events-auto w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Icons.Alert className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{alert.message}</p>
                  {!isSettingsPage && (
                    <div className="mt-3 flex space-x-7">
                      <Button
                        onClick={() => {
                          navigate('/innstillinger');
                        }}
                      >
                        Gå til innstillingene
                      </Button>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex flex-shrink-0">
                  <button
                    type="button"
                    className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                    onClick={() => {
                      dispatch(dismissAlert(alert.id));
                    }}
                  >
                    <span className="sr-only">Lukk</span>
                    <Icons.Close className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Transition>
    </div>
  );
};
