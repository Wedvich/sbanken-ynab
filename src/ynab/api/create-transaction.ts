import { YnabActionType } from '../reducer';

export const createTransactionRequest = () => ({
  type: YnabActionType.CreateTransactionRequest as YnabActionType.CreateTransactionRequest,
});

export const createTransactionResponse = () => ({
  type: YnabActionType.CreateTransactionResponse as YnabActionType.CreateTransactionResponse,
});
