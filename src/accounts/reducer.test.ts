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

describe('add', () => {
  it('adds an account', () => {
    const initialState = [testAccount1, testAccount2];

    const state = reducer(initialState, actions.add(testAccount3));

    expect(state).toEqual([testAccount1, testAccount2, testAccount3]);
  });

  it('does not add an already existing account', () => {
    const initialState = [testAccount2, testAccount3];

    const state = reducer(initialState, actions.add(testAccount2));

    expect(state).toEqual([testAccount2, testAccount3]);
  });
});

describe('remove', () => {
  it('removes an account', () => {
    const initialState = [testAccount1, testAccount2];

    const state = reducer(initialState, actions.remove(testAccount1));

    expect(state).toEqual([testAccount2]);
  });

  it('does nothing if the account does not exist', () => {
    const initialState = [testAccount1];

    const state = reducer(initialState, actions.remove(testAccount2));

    expect(state).toEqual([testAccount1]);
  });
});

describe('rename', () => {
  it('renames an account', () => {
    const initialState = [testAccount1];

    const state = reducer(initialState, actions.rename(testAccount1, 'Account 4'));

    expect(state[0]).toMatchObject({
      displayName: 'Account 4',
    });
  });

  it('does nothing if the account is not found', () => {
    const initialState = [testAccount1];

    const state = reducer(initialState, actions.rename(testAccount2, 'Account 4'));

    expect(state[0]).toMatchObject(testAccount1);
  });
});

describe('reorder', () => {
  it('correctly reorders accounts from the front', () => {
    const initialState = [testAccount1, testAccount2, testAccount3];

    const state = reducer(initialState, actions.reorder(0, 1));

    expect(state).toEqual([testAccount2, testAccount1, testAccount3]);
  });

  it('correctly reorders accounts from the back', () => {
    const initialState = [testAccount1, testAccount2, testAccount3];

    const state = reducer(initialState, actions.reorder(2, 0));

    expect(state).toEqual([testAccount3, testAccount1, testAccount2]);
  });

  it('correctly reorders accounts from the middle', () => {
    const initialState = [testAccount1, testAccount2, testAccount3];

    const state = reducer(initialState, actions.reorder(1, 2));

    expect(state).toEqual([testAccount1, testAccount3, testAccount2]);
  });
});
