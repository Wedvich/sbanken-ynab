/** @vitest-environment jsdom */

import type { AnyAction } from '@reduxjs/toolkit';
import type { RootState } from '.';
import { ynabSlice, adjustAccountBalance, ynabAccountsAdapter, YnabState } from './ynab';
import type { YnabAccountWithBudgetId } from './ynab.types';

describe('setServerKnowledge', () => {
  it('sets the latest server knowledge', () => {
    const state = ynabSlice.reducer(
      ynabSlice.getInitialState(),
      ynabSlice.actions.setServerKnowledge({ budgetId: 'abc', knowledge: 2 })
    );

    expect(state.serverKnowledgeByBudgetId['abc']?.latest).toBe(2);
  });

  it('updates the latest server knowledge', () => {
    const initialState = ynabSlice.reducer(
      ynabSlice.getInitialState(),
      ynabSlice.actions.setServerKnowledge({ budgetId: 'abc', knowledge: 2 })
    );

    const state = ynabSlice.reducer(
      initialState,
      ynabSlice.actions.setServerKnowledge({ budgetId: 'abc', knowledge: 3 })
    );

    expect(state.serverKnowledgeByBudgetId['abc']?.latest).toBe(3);
  });

  it('does not update the latest server knowledge to a lower value', () => {
    const initialState = ynabSlice.reducer(
      ynabSlice.getInitialState(),
      ynabSlice.actions.setServerKnowledge({ budgetId: 'abc', knowledge: 2 })
    );

    const state = ynabSlice.reducer(
      initialState,
      ynabSlice.actions.setServerKnowledge({ budgetId: 'abc', knowledge: 1 })
    );

    expect(state.serverKnowledgeByBudgetId['abc']?.latest).toBe(2);
  });

  describe('with endpoint', () => {
    it('sets the latest server knowledge', () => {
      const state = ynabSlice.reducer(
        ynabSlice.getInitialState(),
        ynabSlice.actions.setServerKnowledge({ budgetId: 'abc', knowledge: 2, endpoint: 'def' })
      );

      expect(state.serverKnowledgeByBudgetId['abc']?.byEndpoint['def']).toBe(2);
    });

    it('updates the latest server knowledge', () => {
      const initialState = ynabSlice.reducer(
        ynabSlice.getInitialState(),
        ynabSlice.actions.setServerKnowledge({ budgetId: 'abc', knowledge: 2, endpoint: 'def' })
      );

      const state = ynabSlice.reducer(
        initialState,
        ynabSlice.actions.setServerKnowledge({ budgetId: 'abc', knowledge: 3, endpoint: 'def' })
      );

      expect(state.serverKnowledgeByBudgetId['abc']?.byEndpoint['def']).toBe(3);
    });

    it('does not update the latest server knowledge to a lower value', () => {
      const initialState = ynabSlice.reducer(
        ynabSlice.getInitialState(),
        ynabSlice.actions.setServerKnowledge({ budgetId: 'abc', knowledge: 2, endpoint: 'def' })
      );

      const state = ynabSlice.reducer(
        initialState,
        ynabSlice.actions.setServerKnowledge({ budgetId: 'abc', knowledge: 1, endpoint: 'def' })
      );

      expect(state.serverKnowledgeByBudgetId['abc']?.byEndpoint['def']).toBe(2);
    });
  });
});

describe('clearServerKnowledge', () => {
  it('clears server knowledge for an endpoint', () => {
    const initialState = ynabSlice.reducer(
      ynabSlice.getInitialState(),
      ynabSlice.actions.setServerKnowledge({ budgetId: 'abc', knowledge: 2, endpoint: 'def' })
    );

    const state = ynabSlice.reducer(
      initialState,
      ynabSlice.actions.clearServerKnowledge({ budgetId: 'abc', endpoint: 'def' })
    );

    expect(state.serverKnowledgeByBudgetId['abc']?.byEndpoint['def']).toBeUndefined();
  });
});

describe('adjustServerKnowledge', () => {
  const dispatch = vi.fn();
  let state: YnabState;
  const getState = () => ({ [ynabSlice.name]: state } as RootState);

  beforeEach(() => {
    state = {
      ...ynabSlice.getInitialState(),
      accounts: ynabAccountsAdapter.setOne(ynabAccountsAdapter.getInitialState(), {
        id: 'abc',
        uncleared_balance: 100,
        cleared_balance: 200,
        balance: 300,
      } as YnabAccountWithBudgetId),
    };
  });

  it('adjusts the uncleared account balance', () => {
    const { undo } = adjustAccountBalance({ accountId: 'abc', amount: 100, cleared: false })(
      dispatch,
      getState,
      undefined
    );

    state = ynabSlice.reducer(state, dispatch.mock.lastCall![0] as AnyAction);

    expect(state.accounts.entities['abc']).toMatchObject<Partial<YnabAccountWithBudgetId>>({
      uncleared_balance: 200,
      cleared_balance: 200,
      balance: 400,
    });

    undo();

    state = ynabSlice.reducer(state, dispatch.mock.lastCall![0] as AnyAction);

    expect(state.accounts.entities['abc']).toMatchObject<Partial<YnabAccountWithBudgetId>>({
      uncleared_balance: 100,
      cleared_balance: 200,
      balance: 300,
    });
  });

  it('adjusts the cleared account balance', () => {
    const { undo } = adjustAccountBalance({ accountId: 'abc', amount: 100, cleared: true })(
      dispatch,
      getState,
      undefined
    );

    state = ynabSlice.reducer(state, dispatch.mock.lastCall![0] as AnyAction);

    expect(state.accounts.entities['abc']).toMatchObject<Partial<YnabAccountWithBudgetId>>({
      uncleared_balance: 100,
      cleared_balance: 300,
      balance: 400,
    });

    undo();

    state = ynabSlice.reducer(state, dispatch.mock.lastCall![0] as AnyAction);

    expect(state.accounts.entities['abc']).toMatchObject<Partial<YnabAccountWithBudgetId>>({
      uncleared_balance: 100,
      cleared_balance: 200,
      balance: 300,
    });
  });
});
