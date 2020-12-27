import { DateTime } from 'luxon';

const currencyConverter = new Intl.NumberFormat('nb', { style: 'currency', currency: 'NOK' });

export const formatCurrency = (amount: number) => currencyConverter.format(amount);

export const formatDate = (date: DateTime) => date.toFormat('yyyy-MM-dd');
