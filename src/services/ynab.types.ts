import type { EntityState } from '@reduxjs/toolkit';
import type { Transaction } from './transactions';

export interface YnabAccount {
  id: string;
  name: string;
  type: string;
  on_budget: boolean;
  closed: boolean;
  note: string;
  balance: number;
  cleared_balance: number;
  uncleared_balance: number;
  transfer_payee_id: string;
  direct_import_linked: boolean;
  direct_import_in_error: boolean;
  deleted: boolean;
}

export interface YnabAccountWithBudgetId extends YnabAccount {
  budget_id: string;
}

export interface YnabTransaction {
  id: string;
  date: string;
  amount: number;
  memo?: string;
  cleared: string;
  approved: boolean;
  flag_color: string;
  account_id: string;
  payee_id: string;
  category_id: string;
  transfer_account_id: string;
  transfer_transaction_id: string;
  matched_transaction_id: string;
  import_id?: string;
  deleted: boolean;
  account_name: string;
  payee_name: string;
  category_name: string;
  subtransactions: Array<{
    id: string;
    transaction_id: string;
    amount: number;
    memo: string;
    payee_id: string;
    payee_name: string;
    category_id: string;
    category_name: string;
    transfer_account_id: string;
    transfer_transaction_id: string;
    deleted: boolean;
  }>;
}

export interface YnabBudget {
  id: string;
  name: string;
  last_modified_on: string;
  first_month: string;
  last_month: string;
  date_format: {
    format: string;
  };
  currency_format: {
    iso_code: string;
    example_format: string;
    decimal_digits: number;
    decimal_separator: string;
    symbol_first: boolean;
    group_separator: string;
    currency_symbol: string;
    display_symbol: boolean;
  };
}

export interface YnabBudgetWithAccounts extends YnabBudget {
  accounts: Array<YnabAccount>;
}

export interface YnabGetBudgetsResponse {
  budgets: Array<YnabBudgetWithAccounts>;
  default_budget: string | null;
}

export interface YnabRateLimit {
  limit: number;
  maxLimit: number;
}

export interface YnabGetTransactionsRequest {
  budgetId: string;
  fromDate: string;
  serverKnowledge?: number;
}

export interface YnabSuccessResponse<T = unknown> {
  data: T;
}

export interface YnabGetTransactionsResponse {
  transactions: Array<YnabTransaction>;
  server_knowledge: number;
}

export interface YnabGetTransactionsEntities {
  transactions: EntityState<YnabTransaction>;
  serverKnowledge: number;
}

export type YnabAccountsResponse = YnabSuccessResponse<{
  accounts: Array<YnabAccount>;
  server_knowledge: number;
}>;

export interface YnabErrorResponse {
  error: {
    id: string;
    name: string;
    detail: string;
  };
}

export interface YnabCreateTransactionRequest {
  accountId: string;
  fromDate: string;
  transaction: Transaction;
}

export interface YnabCreateTransactionResponse {
  transaction_ids: Array<string>;
  transaction: YnabTransaction;
  duplicate_import_ids: Array<string>;
  server_knowledge: number;
}

export interface YnabCreateTransactionsEntity {
  transaction: YnabTransaction;
  serverKnowledge: number;
}

export enum YnabClearedState {
  Uncleared = 'uncleared',
  Cleared = 'cleared',
  Reconciled = 'reconciled',
}
