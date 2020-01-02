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

// TODO: Fill interface with fields
export interface YnabTransaction {
  id: string;
}
