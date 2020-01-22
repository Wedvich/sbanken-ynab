import React from 'react';
import { ConnectedAccount } from '../types';
import { formatCurrency, getNumberClass } from '../utils';

import './balance.scss';

interface BalanceProps {
  account: ConnectedAccount;
}

const Balance = ({ account }: BalanceProps) => {
  return (
    <table className="sby-balance">
      <thead>
        <tr>
          <td className="operator" />
          <th scope="col">Bokført saldo</th>
          <th scope="col" />
          <th scope="col">Ikke bokført</th>
          <th scope="col" />
          <th scope="col">Disponibel saldo</th>
          <th className="pull" />
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
          <th scope="row">YNAB</th>
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
