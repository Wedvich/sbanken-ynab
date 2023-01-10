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
      <DndProvider backend={HTML5Backend}>
        <RouterProvider router={router} />
      </DndProvider>
    </Provider>,
    appElement
  );
}
