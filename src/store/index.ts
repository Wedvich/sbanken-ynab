import { createStore } from 'redux';

const rootReducer = () => ({});

export default () => {
  const store = createStore(rootReducer);
  return store;
};
