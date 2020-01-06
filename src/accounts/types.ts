import { DateTime } from 'luxon';

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

export interface NormalizedTransaction {
  amount: number;
  connectedAccountId?: string;
  date: DateTime;
  description: string;
  id: string;
  payee: string | null;
  source: TransactionSource;
}

export interface MatchedTransaction {
  sbankenTransaction: NormalizedTransaction;
  ynabTransaction: NormalizedTransaction;
}
