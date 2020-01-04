import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';
import { Link, useParams } from 'react-router-dom';
import { accountsSelector } from '../selectors';
import Icon, { IconType } from '../../shared/icon';

const Nav = () => {
  const connectedAccounts = useSelector(accountsSelector);
  const { accountId } = useParams<{ accountId?: string }>();

  return (
    <nav className="sby-accounts-nav">
      <h3>Kontoer</h3>
      {connectedAccounts.map((account) => (
        <Link
          key={account.compoundId}
          to={`/accounts/${account.compoundId}`}
          className={cx({
            'active': accountId === account.compoundId,
            'has-diffs': account.diffs,
          })}
        >
          {account.displayName}
          <Icon type={account.diffs ? IconType.Alert : IconType.Success} />
        </Link>
      ))}
      {/* <li>
      + Legg til kobling
      </li> */}
    </nav>
  );
};

export default React.memo(Nav);
