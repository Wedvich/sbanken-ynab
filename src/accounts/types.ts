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
  unclearedBankBalance: number;
  unclearedBudgetBalance: number;
}
