// ['unload', 'beforeunload'].forEach(function (eventName) {
//   window.addEventListener(eventName, function () {
//     // eslint-disable-next-line no-debugger
//     debugger;
//   });
// });

if (process.env.NODE_ENV === 'development') {
  const { worker } = await import('./mocks/browser');
  await worker.start({
    serviceWorker: {
      options: {
        scope: '/',
      },
    },
  });
}

import 'preact/debug';
import { Fragment, h, render } from 'preact';
import { Provider } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './app';
import { store } from './services';
import ServiceWorkerManager from './service-worker/manager';

import { Settings } from 'luxon';
import { Alerts } from './components/alerts';
Settings.defaultLocale = 'nb';

const router = createBrowserRouter([
  {
    path: '*',
    element: (
      <Fragment>
        {process.env.NODE_ENV === 'production' && <ServiceWorkerManager />}
        <App />
        <Alerts />
      </Fragment>
    ),
  },
]);

const appElement = document.getElementById('sby');

if (appElement) {
  render(
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <RouterProvider router={router} />
      </DndProvider>
    </Provider>,
    appElement
  );
}
