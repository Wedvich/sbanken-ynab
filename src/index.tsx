import 'preact/debug';
import { h, render } from 'preact';
import { App } from './app';

const appElement = document.getElementById('sby');

if (appElement) {
  render(<App />, appElement);
}
