import 'preact/debug';
import { Fragment, h, render } from 'preact';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './app';
import { Provider } from 'react-redux';
import { store } from './services';
import ServiceWorkerManager from './service-worker/manager';

import { Settings } from 'luxon';
Settings.defaultLocale = 'nb';

const appElement = document.getElementById('sby');

const router = createBrowserRouter([
  {
    path: '*',
    element: (
      <Fragment>
        <ServiceWorkerManager />
        <App />
      </Fragment>
    ),
  },
]);

if (appElement) {
  render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
    appElement
  );
}
