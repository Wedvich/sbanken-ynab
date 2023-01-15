/** @vitest-environment jsdom */

import { ynabSlice } from './ynab';

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
