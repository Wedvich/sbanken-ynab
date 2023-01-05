import 'preact/debug';
import { h, render } from 'preact';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app2';
import { Provider } from 'react-redux';
import { store } from './services';
import ServiceWorkerManager from './service-worker/manager';

const appElement = document.getElementById('sby');

if (appElement) {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <ServiceWorkerManager />
        <App />
      </BrowserRouter>
    </Provider>,
    appElement
  );
}
