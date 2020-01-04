import React from 'react';
import { useSelector } from 'react-redux';
import { formatCurrency  } from '../utils';
import { transactionsSelector } from '../selectors';
import './transactions.scss';

const Transactions = () => {
  const transactions = useSelector(transactionsSelector);

  return (
    <section className="sby-transactions">
      <h2>Nye transaksjoner</h2>
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
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.source}</td>
              <td className="date">{transaction.date}</td>
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
