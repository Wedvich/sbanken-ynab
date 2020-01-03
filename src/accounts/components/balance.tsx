import React from 'react';
import './balance.scss';
import { ConnectedAccount } from '../types';

interface BalanceProps {
  account: ConnectedAccount;
}

const currencyFormatter = new Intl.NumberFormat('no-nb', { style: 'currency', currency: 'NOK' });

const Balance = ({ account }: BalanceProps) => {
  const clearedDiff = account.clearedBudgetBalance - account.clearedBankBalance;
  const unclearedDiff = account.unclearedBudgetBalance - account.unclearedBankBalance;
  const workingDiff = account.workingBudgetBalance - account.workingBankBalance;

  const hasDiff = clearedDiff !== 0 || unclearedDiff !== 0 || workingDiff !== 0;

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
      {hasDiff && (
        <tr>
          <th scope="row">Ynab diff</th>
          <td className={clearedDiff >= 0 ? 'positive' : 'negative'}>
            {currencyFormatter.format(clearedDiff)}
          </td>
          <td className="operator">+</td>
          <td className={unclearedDiff >= 0 ? 'positive' : 'negative'}>
            {currencyFormatter.format(unclearedDiff)}
          </td>
          <td className="operator">=</td>
          <td className={workingDiff >= 0 ? 'positive' : 'negative'}>
            {currencyFormatter.format(workingDiff)}
          </td>
        </tr>
      )}
    </table>
  );
};

export default React.memo(Balance);
