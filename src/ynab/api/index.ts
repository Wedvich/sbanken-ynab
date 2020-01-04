export const ynabApiBaseUrl = 'https://api.youneedabudget.com/v1';

export interface YnabAccount {
  balance: number;
  cleared_balance: number;
  closed: boolean;
  deleted: boolean;
  id: string;
  name: string;
  note: string;
  on_budget: boolean;
  transfer_payee_id: string;
  type: string;
  uncleared_balance: number;
}

export interface YnabTransaction {
  account_id: string;
  account_name: string;
  amount: number;
  approved: boolean;
  category_id: string | null;
  category_name: string | null;
  cleared: string;
  date: string;
  deleted: boolean;
  flag_color: string | null;
  id: string;
  import_id: string | null;
  matched_transaction_id: string | null;
  memo: string;
  payee_id: string | null;
  payee_name: string | null;
  subtransactions: [];
  transfer_account_id: string | null;
  transfer_transaction_id: string | null;
}
