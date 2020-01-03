import React from 'react';
import './balance.scss';
import { ConnectedAccount } from '../types';

interface BalanceProps {
  account: ConnectedAccount;
}

const currencyFormatter = new Intl.NumberFormat('no-nb', { style: 'currency', currency: 'NOK' });

const Balance = ({ account }: BalanceProps) => {
  return (
    <table className="sby-balance">
      <tr>
        <td className="operator" />
        <th scope="col">Cleared balance</th>
        <th scope="col" />
        <th scope="col">Uncleared balance</th>
        <th scope="col" />
        <th scope="col">Working balance</th>
      </tr>
      <tr>
        <th scope="row">Sbanken</th>
        <td className={account.clearedBankBalance >= 0 ? 'positive' : 'negative'}>
          {currencyFormatter.format(account.clearedBankBalance)}
        </td>
        <td className="operator">+</td>
        <td className={account.unclearedBankBalance >= 0 ? 'positive' : 'negative'}>
          {currencyFormatter.format(account.unclearedBankBalance)}
        </td>
        <td className="operator">=</td>
        <td className={account.workingBankBalance >= 0 ? 'positive' : 'negative'}>
          {currencyFormatter.format(account.workingBankBalance)}
        </td>
      </tr>
      <tr>
        <th scope="row">Ynab</th>
        <td className={account.clearedBudgetBalance >= 0 ? 'positive' : 'negative'}>
          {currencyFormatter.format(account.clearedBudgetBalance)}
        </td>
        <td className="operator">+</td>
        <td className={account.unclearedBudgetBalance >= 0 ? 'positive' : 'negative'}>
          {currencyFormatter.format(account.unclearedBudgetBalance)}
        </td>
        <td className="operator">=</td>
        <td className={account.workingBudgetBalance >= 0 ? 'positive' : 'negative'}>
          {currencyFormatter.format(account.workingBudgetBalance)}
        </td>
      </tr>
      {account.diffs && (
        <tr>
          <th scope="row">Ynab diff</th>
          <td className={account.diffs.cleared >= 0 ? 'positive' : 'negative'}>
            {currencyFormatter.format(account.diffs.cleared)}
          </td>
          <td className="operator">+</td>
          <td className={account.diffs.uncleared >= 0 ? 'positive' : 'negative'}>
            {currencyFormatter.format(account.diffs.uncleared)}
          </td>
          <td className="operator">=</td>
          <td className={account.diffs.working >= 0 ? 'positive' : 'negative'}>
            {currencyFormatter.format(account.diffs.working)}
          </td>
        </tr>
      )}
    </table>
  );
};

export default React.memo(Balance);
