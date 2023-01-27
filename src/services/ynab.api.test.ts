/** @vitest-environment jsdom */

import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.patch('https://api.youneedabudget.com/v1/budgets/b1/transactions', (req, res, ctx) => {
    console.log('req', req.json());
    return res(ctx.status(209));
  })
);

import type { DeepPartial } from '@reduxjs/toolkit';
import { produce } from 'immer';
import { createStore, RootState } from '.';
import { ynabAccountsAdapter, ynabSlice } from './ynab';
import { ynabClearTransactionsApi } from './ynab.api';
import { YnabAccountWithBudgetId, YnabClearedState, YnabTransaction } from './ynab.types';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => {
  server.close();
});
afterEach(() => server.resetHandlers());

describe('useClearTransactionsMutation', () => {
  it('updates transactions in a single budget', async () => {
    const initialState = produce(ynabSlice.getInitialState(), (draft) => {
      draft.accounts = ynabAccountsAdapter.setOne(draft.accounts, {
        id: 'a1',
        budget_id: 'b1',
      } as YnabAccountWithBudgetId);
      draft.tokensByBudgetId['b1'] = ['xx'];
    });

    const store = createStore(true, {
      ynab: initialState,
    } as DeepPartial<RootState>);

    const transactions = [
      {
        id: 't1',
        account_id: 'a1',
        cleared: YnabClearedState.Uncleared,
      } as YnabTransaction,
      {
        id: 't2',
        account_id: 'a1',
        cleared: YnabClearedState.Uncleared,
      } as YnabTransaction,
    ];

    await store.dispatch(
      ynabClearTransactionsApi.endpoints.clearTransactions.initiate({ transactions })
    );
  });

  // it('updates transactions across multiple budgets', () => {
  //   const store = createStore(false);
  // });
});
