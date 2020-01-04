import React from 'react';
import { ConnectedAccount } from '../types';
import { formatCurrency } from '../utils';
import './balance.scss';

interface BalanceProps {
  account: ConnectedAccount;
}

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
          {formatCurrency(account.clearedBankBalance)}
        </td>
        <td className="operator">+</td>
        <td className={account.unclearedBankBalance >= 0 ? 'positive' : 'negative'}>
          {formatCurrency(account.unclearedBankBalance)}
        </td>
        <td className="operator">=</td>
        <td className={account.workingBankBalance >= 0 ? 'positive' : 'negative'}>
          {formatCurrency(account.workingBankBalance)}
        </td>
      </tr>
      <tr>
        <th scope="row">Ynab</th>
        <td className={account.clearedBudgetBalance >= 0 ? 'positive' : 'negative'}>
          {formatCurrency(account.clearedBudgetBalance)}
        </td>
        <td className="operator">+</td>
        <td className={account.unclearedBudgetBalance >= 0 ? 'positive' : 'negative'}>
          {formatCurrency(account.unclearedBudgetBalance)}
        </td>
        <td className="operator">=</td>
        <td className={account.workingBudgetBalance >= 0 ? 'positive' : 'negative'}>
          {formatCurrency(account.workingBudgetBalance)}
        </td>
      </tr>
      {account.diffs && (
        <tr>
          <th scope="row">Ynab diff</th>
          <td className={account.diffs.cleared >= 0 ? 'positive' : 'negative'}>
            {formatCurrency(account.diffs.cleared)}
          </td>
          <td className="operator">+</td>
          <td className={account.diffs.uncleared >= 0 ? 'positive' : 'negative'}>
            {formatCurrency(account.diffs.uncleared)}
          </td>
          <td className="operator">=</td>
          <td className={account.diffs.working >= 0 ? 'positive' : 'negative'}>
            {formatCurrency(account.diffs.working)}
          </td>
        </tr>
      )}
    </table>
  );
};

export default React.memo(Balance);
