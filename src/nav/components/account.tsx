import React from 'react';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import { ConnectedAccount } from '../../accounts/types';
import { getNumberClass, formatCurrency } from '../../accounts/utils';

interface NavAccountProps {
  account: ConnectedAccount;
  active?: boolean;
}

const NavAccount = ({ account, active }: NavAccountProps) => {
  const hasDiffs = !!account.diffs;
  return (
    <Link
      to={`/accounts/${account.compoundId}`}
      className={cx({
        'active': active,
        'has-diffs': hasDiffs,
      })}
    >
      <span className="label">{account.displayName}</span>
      <div className="balance">
        <div className={getNumberClass(account.workingBankBalance)}>
          {hasDiffs && <span>Sbanken: </span>} {formatCurrency(account.workingBankBalance)}
        </div>
        {hasDiffs && (
          <div className={getNumberClass(account.workingBudgetBalance)}>
            <span>YNAB: </span> {formatCurrency(account.workingBudgetBalance)}
          </div>
        )}
      </div>
    </Link>
  );
};

export default React.memo(NavAccount);
