import type { EntityState } from '@reduxjs/toolkit';
import { sbankenTransactionsAdapter } from './sbanken.api';
import type { SbankenTransactionWithAccountId } from './sbanken.types';

export const getAllSbankenTransactions = (state?: EntityState<SbankenTransactionWithAccountId>) =>
  state ? sbankenTransactionsAdapter.getSelectors().selectAll(state) : [];
