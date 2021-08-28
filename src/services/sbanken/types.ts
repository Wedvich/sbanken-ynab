export interface SbankenTransactionBase {
  accountingDate: string;
  amount: number;
  interestDate: string;
  source: string;
  text: string;
  transactionType: string;
  transactionTypeCode: string;
  transactionTypeText: string;
}

export interface SbankenTransaction extends SbankenTransactionBase {
  cardDetails?: unknown;
  cardDetailsSpecified?: boolean;
  isReservation?: boolean;
  otherAccountNumber?: string;
  otherAccountNumberSpecified?: boolean;
  reservationType?: string;
  transactionDetail?: unknown;
  transactionDetailSpecified?: boolean;
  transactionId?: string;
}
