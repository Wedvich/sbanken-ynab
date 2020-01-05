import React from 'react';
import { ConnectedAccount } from '../types';
import { formatCurrency } from '../utils';
import './balance.scss';

interface BalanceProps {
  account: ConnectedAccount;
}

const getNumberClass = (amount: number) => amount > 0 ? 'positive' : amount < 0 ? 'negative' : 'neutral';

const Balance = ({ account }: BalanceProps) => {
  console.log(account, account.diffs);
  return (
    <table className="sby-balance">
      <thead>
        <tr>
          <td className="operator" />
          <th scope="col">Cleared balance</th>
          <th scope="col" />
          <th scope="col">Uncleared balance</th>
          <th scope="col" />
          <th scope="col">Working balance</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Sbanken</th>
          <td className={getNumberClass(account.clearedBankBalance)}>
            {formatCurrency(account.clearedBankBalance)}
          </td>
          <td className="operator">+</td>
          <td className={getNumberClass(account.unclearedBankBalance)}>
            {formatCurrency(account.unclearedBankBalance)}
          </td>
          <td className="operator">=</td>
          <td className={getNumberClass(account.workingBankBalance)}>
            {formatCurrency(account.workingBankBalance)}
          </td>
        </tr>
        <tr>
          <th scope="row">Ynab</th>
          <td className={getNumberClass(account.clearedBudgetBalance)}>
            {formatCurrency(account.clearedBudgetBalance)}
          </td>
          <td className="operator">+</td>
          <td className={getNumberClass(account.unclearedBudgetBalance)}>
            {formatCurrency(account.unclearedBudgetBalance)}
          </td>
          <td className="operator">=</td>
          <td className={getNumberClass(account.workingBudgetBalance)}>
            {formatCurrency(account.workingBudgetBalance)}
          </td>
        </tr>
        {account.diffs && (
          <tr>
            <th scope="row">Ynab diff</th>
            <td className={getNumberClass(account.diffs.cleared)}>
              {formatCurrency(account.diffs.cleared)}
            </td>
            <td className="operator">+</td>
            <td className={getNumberClass(account.diffs.uncleared)}>
              {formatCurrency(account.diffs.uncleared)}
            </td>
            <td className="operator">=</td>
            <td className={getNumberClass(account.diffs.working)}>
              {formatCurrency(account.diffs.working)}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default React.memo(Balance);
