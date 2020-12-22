import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAccountId } from '../utils';
import { formatCurrency, formatDate } from '../../localization';
import transactionsSelector from '../selectors/transactions';
import { loadingSelector } from '../../shared/utils';
import { actions as ynabActions } from '../../ynab/reducer';
import { TransactionSource } from '../types';

import './transactions.scss';

const Transactions = () => {
  const transactions = useSelector(transactionsSelector);
  const accountId = useAccountId();
  const loading = useSelector(loadingSelector);
  const dispatch = useDispatch();

  const accountTransactions = transactions.filter(
    (transaction) => transaction.connectedAccountId === accountId
  );

  const { sumOut, sumIn } = accountTransactions.reduce(
    (previousSums, transaction) => {
      if (transaction.amount < 0) {
        previousSums.sumOut += Math.abs(transaction.amount);
      } else {
        previousSums.sumIn += transaction.amount;
      }
      return previousSums;
    },
    { sumOut: 0, sumIn: 0 }
  );

  return (
    <section className="sby-transactions">
      <h2>Kanskje noen av disse transaksjonene mangler eller er feil?</h2>
      <table>
        <thead>
          <tr>
            <th>Kilde</th>
            <th>Dato</th>
            <th>Beskrivelse</th>
            <th>Ut</th>
            <th>Inn</th>
            <th className="actions" />
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
              <td className="sby-button-group actions">
                {transaction.source === TransactionSource.Sbanken && (
                  <button
                    disabled={loading}
                    onClick={() => {
                      dispatch(ynabActions.createTransactionRequest(transaction.id));
                    }}
                    title="Opprett i YNAB"
                  >
                    +
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td />
            <td />
            <td />
            <td className="currency">{formatCurrency(sumOut)}</td>
            <td className="currency">{formatCurrency(sumIn)}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </section>
  );
};

export default React.memo(Transactions);
