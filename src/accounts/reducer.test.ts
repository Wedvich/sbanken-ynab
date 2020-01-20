import reducer, { actions } from './reducer';
import { ConnectedAccountSource } from './types';

const testAccount1: ConnectedAccountSource = {
  displayName: 'Account 1',
  sbankenId: 'sb-1',
  ynabId: 'ynab-1',
};

const testAccount2: ConnectedAccountSource = {
  displayName: 'Account 2',
  sbankenId: 'sb-2',
  ynabId: 'ynab-2',
};

const testAccount3: ConnectedAccountSource = {
  displayName: 'Account 3',
  sbankenId: 'sb-3',
  ynabId: 'ynab-3',
};

describe('reorder', () => {
  it('correctly reorders items from the front', () => {
    let initialState = reducer(undefined, {} as any);
    initialState = reducer(initialState, actions.add(testAccount1));
    initialState = reducer(initialState, actions.add(testAccount2));
    initialState = reducer(initialState, actions.add(testAccount3));

    const state = reducer(initialState, actions.reorder(0, 1));
    expect(state[0]).toBe(testAccount2);
    expect(state[1]).toBe(testAccount1);
    expect(state[2]).toBe(testAccount3);
  });

  it('correctly reorders items from the back', () => {
    let initialState = reducer(undefined, {} as any);
    initialState = reducer(initialState, actions.add(testAccount1));
    initialState = reducer(initialState, actions.add(testAccount2));
    initialState = reducer(initialState, actions.add(testAccount3));

    const state = reducer(initialState, actions.reorder(2, 0));
    expect(state[0]).toBe(testAccount3);
    expect(state[1]).toBe(testAccount1);
    expect(state[2]).toBe(testAccount2);
  });

  it('correctly reorders items from the middle', () => {
    let initialState = reducer(undefined, {} as any);
    initialState = reducer(initialState, actions.add(testAccount1));
    initialState = reducer(initialState, actions.add(testAccount2));
    initialState = reducer(initialState, actions.add(testAccount3));

    const state = reducer(initialState, actions.reorder(1, 2));
    expect(state[0]).toBe(testAccount1);
    expect(state[1]).toBe(testAccount3);
    expect(state[2]).toBe(testAccount2);
  });
});
