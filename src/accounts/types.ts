export interface ConnectedAccountSource {
  displayName: string;
  sbankenId: string;
  ynabId: string;
}

export interface ConnectedAccount extends ConnectedAccountSource {
  creditLimit: number;
  compoundId: string;
  clearedBankBalance: number;
  clearedBudgetBalance: number;
  diffs: {
    cleared: number;
    uncleared: number;
    working: number;
  } | null;
  unclearedBankBalance: number;
  unclearedBudgetBalance: number;
  workingBankBalance: number;
  workingBudgetBalance: number;
}

export enum TransactionSource {
  Sbanken = 'sbanken',
  Ynab = 'ynab',
}

export interface Transaction {
  connectedAccountId?: string;
  date: string;
  amount: number;
  payee: string | null;
  source: TransactionSource;
}
