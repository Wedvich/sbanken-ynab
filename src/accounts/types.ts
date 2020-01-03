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
