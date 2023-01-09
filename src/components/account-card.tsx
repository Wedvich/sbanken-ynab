import classNames from 'classnames';
import { h } from 'preact';
import { NavLink } from 'react-router-dom';
import type { EnrichedAccount } from '../services/accounts';
import { formatMoney } from '../utils';

interface AccountCardProps {
  account: EnrichedAccount;
  inSidebar?: boolean;
}

export const AccountCard = ({ account }: AccountCardProps) => {
  return (
    <NavLink
      to={`/kontoer/${account.compositeId}`}
      className={({ isActive }) =>
        classNames('group block items-center px-2 py-2 font-medium rounded-md', {
          'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white': !isActive,
          'bg-gray-900 text-white': isActive,
        })
      }
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="font-medium">{account.name}</span>
        <span className="text-sm text-gray-400">Balanse</span>
      </div>
      <div className="grid grid-cols-[auto_1fr] items-baseline">
        <span className="text-sm text-gray-400">YNAB</span>
        <span className="text-xl font-numbers font-medium text-right tabular-nums">
          {formatMoney(account.ynabWorkingBalance)}
        </span>
        <span className="text-sm text-gray-400">Sbanken</span>
        <span className="text-xl font-numbers font-medium text-right tabular-nums">
          {formatMoney(account.sbankenWorkingBalance)}
        </span>
      </div>
    </NavLink>
  );
};
