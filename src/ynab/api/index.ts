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
