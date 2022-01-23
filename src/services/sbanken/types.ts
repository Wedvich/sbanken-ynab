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
  _checksum?: number;
  _inferredDate?: string;
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
