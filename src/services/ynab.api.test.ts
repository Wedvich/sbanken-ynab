/* @vitest-environment jsdom */

import undici from 'undici';
import type { DeepPartial } from '@reduxjs/toolkit';
import { produce } from 'immer';
import { createStore, RootState } from '.';
import { ynabAccountsAdapter, ynabSlice } from './ynab';
import { ynabClearTransactionsApi } from './ynab.api';
import {
  YnabAccountWithBudgetId,
  YnabClearedState,
  YnabClearTransactionsEntities,
  YnabClearTransactionsRequest,
  YnabClearTransactionsResponse,
  YnabTransaction,
} from './ynab.types';
import { ynabApiBaseUrl } from '../config';
import type { MockInterceptor } from 'undici/types/mock-interceptor';

const mockAgent = new undici.MockAgent();
mockAgent.disableNetConnect();
undici.setGlobalDispatcher(mockAgent);

const mockAccountId1 = 'a1';
const mockAccountId2 = 'a2';
const mockAccountId3 = 'a3';
const mockBudgetId1 = 'b1';
const mockBudgetId2 = 'b2';
const mockBudgetId3 = 'b3';

const apiUrl = new URL(ynabApiBaseUrl);
const apiPool = mockAgent.get(apiUrl.origin);

const mockReplyCallback: MockInterceptor.MockReplyOptionsCallback<object> = (options) => {
  const requestBody = JSON.parse<YnabClearTransactionsRequest>(options.body as string);
  let serverKnowledge = 0;
  const transactionIds = requestBody.transactions.map((t) => {
    serverKnowledge = t.account_id === mockAccountId1 ? 1 : 2;
    return t.id;
  });
  return {
    data: JSON.stringify({
      data: {
        transaction_ids: transactionIds,
        transactions: requestBody.transactions,
        duplicate_import_ids: [],
        server_knowledge: serverKnowledge,
      } as YnabClearTransactionsResponse,
    }),
    statusCode: 200,
  };
};

apiPool
  .intercept({
    path: `${apiUrl.pathname}/budgets/${mockBudgetId1}/transactions`,
    method: 'patch',
  })
  .reply(mockReplyCallback)
  .times(Number.MAX_SAFE_INTEGER);

apiPool
  .intercept({
    path: `${apiUrl.pathname}/budgets/${mockBudgetId2}/transactions`,
    method: 'patch',
  })
  .reply(mockReplyCallback)
  .times(Number.MAX_SAFE_INTEGER);

apiPool
  .intercept({
    path: `${apiUrl.pathname}/budgets/${mockBudgetId3}/transactions`,
    method: 'patch',
  })
  .reply(400)
  .times(Number.MAX_SAFE_INTEGER);

describe('useClearTransactionsMutation', () => {
  const initialState = produce(ynabSlice.getInitialState(), (draft) => {
    draft.accounts = ynabAccountsAdapter.setAll(draft.accounts, [
      {
        id: mockAccountId1,
        budget_id: mockBudgetId1,
        cleared_balance: 1000_000,
        uncleared_balance: -300_000,
        balance: 700_000,
      } as YnabAccountWithBudgetId,
      {
        id: mockAccountId2,
        budget_id: mockBudgetId2,
        cleared_balance: 2000_000,
        uncleared_balance: -1100_000,
        balance: 900_000,
      } as YnabAccountWithBudgetId,
      {
        id: mockAccountId3,
        budget_id: mockBudgetId3,
        cleared_balance: 1500_000,
        uncleared_balance: -800_000,
        balance: 700_000,
      } as YnabAccountWithBudgetId,
    ]);
    draft.tokensByBudgetId[mockBudgetId1] = ['xx'];
    draft.tokensByBudgetId[mockBudgetId2] = ['yy'];
    draft.tokensByBudgetId[mockBudgetId3] = ['zz'];
  });

  const transactionsForAccount1 = [
    {
      id: `${mockBudgetId1}-t1`,
      account_id: mockAccountId1,
      amount: -100_000,
      cleared: YnabClearedState.Uncleared,
    } as YnabTransaction,
    {
      id: `${mockBudgetId1}-t2`,
      account_id: mockAccountId1,
      amount: -200_000,
      cleared: YnabClearedState.Uncleared,
    } as YnabTransaction,
  ];

  const transactionsForAccount2 = [
    {
      id: `${mockBudgetId2}-t1`,
      account_id: mockAccountId2,
      amount: -500_000,
      cleared: YnabClearedState.Uncleared,
    } as YnabTransaction,
    {
      id: `${mockBudgetId2}-t2`,
      account_id: mockAccountId2,
      amount: -600_000,
      cleared: YnabClearedState.Uncleared,
    } as YnabTransaction,
  ];

  const transactionsForAccount3 = [
    {
      id: `${mockBudgetId3}-t1`,
      account_id: mockAccountId3,
      amount: -400_000,
      cleared: YnabClearedState.Uncleared,
    } as YnabTransaction,
    {
      id: `${mockBudgetId3}-t2`,
      account_id: mockAccountId3,
      amount: -400_000,
      cleared: YnabClearedState.Uncleared,
    } as YnabTransaction,
  ];

  it('updates transactions for all budgets', async () => {
    const store = createStore(true, {
      ynab: initialState,
    } as DeepPartial<RootState>);

    const transactions = transactionsForAccount1.concat(transactionsForAccount2);
    const { data } = (await store.dispatch(
      ynabClearTransactionsApi.endpoints.clearTransactions.initiate({
        transactions,
        fromDate: '2021-01-01',
      })
    )) as { data: YnabClearTransactionsEntities };

    const expectedTransactions = transactions.map<YnabTransaction>((transaction) => ({
      ...transaction,
      cleared: YnabClearedState.Cleared,
    }));

    expect(data.transactions).toMatchObject(expectedTransactions);
    expect(data.serverKnowledgeByBudgetId[mockBudgetId1]).toBe(1);
    expect(data.serverKnowledgeByBudgetId[mockBudgetId2]).toBe(2);
  });

  it('optimistically updates account balances', async () => {
    const store = createStore(true, {
      ynab: initialState,
    } as DeepPartial<RootState>);

    const transactions = transactionsForAccount1.concat(transactionsForAccount3);
    await store.dispatch(
      ynabClearTransactionsApi.endpoints.clearTransactions.initiate({
        transactions,
        fromDate: '2021-01-01',
      })
    );

    const accountsState = store.getState().ynab.accounts;

    expect(
      ynabAccountsAdapter.getSelectors().selectById(accountsState, mockAccountId1)
    ).toMatchObject({
      cleared_balance: 700_000,
      uncleared_balance: 0,
      balance: 700_000,
    });

    expect(
      ynabAccountsAdapter.getSelectors().selectById(accountsState, mockAccountId3)
    ).toMatchObject({
      cleared_balance: 1500_000,
      uncleared_balance: -800_000,
      balance: 700_000,
    });
  });
});
