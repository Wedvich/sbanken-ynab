import 'preact/debug';
import { h, render } from 'preact';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app';
import { Provider } from 'react-redux';
import { store } from './services';

const appElement = document.getElementById('sby');

if (appElement) {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>,
    appElement
  );
}
