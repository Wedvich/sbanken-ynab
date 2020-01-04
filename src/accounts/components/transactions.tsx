import React from 'react';
import { useSelector } from 'react-redux';
import { formatCurrency, formatDate, useAccountId  } from '../utils';
import { transactionsSelector } from '../selectors';
import './transactions.scss';

const Transactions = () => {
  const transactions = useSelector(transactionsSelector);
  const accountId = useAccountId();

  const accountTransactions = transactions.filter(
    (transaction) => transaction.connectedAccountId === accountId);

  return (
    <section className="sby-transactions">
      <h2>Mulige transaksjoner</h2>
      <table>
        <thead>
          <tr>
            <th>Kilde</th>
            <th>Dato</th>
            <th>Beskrivelse</th>
            <th>Ut</th>
            <th>Inn</th>
          </tr>
        </thead>
        <tbody>
          {accountTransactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.source}</td>
              <td className="date">{formatDate(transaction.date)}</td>
              <td>{transaction.payee}</td>
              <td className="currency">
                {transaction.amount <= 0 ? formatCurrency(-transaction.amount) : ''}
              </td>
              <td className="currency">
                {transaction.amount > 0 ? formatCurrency(transaction.amount) : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default React.memo(Transactions);
