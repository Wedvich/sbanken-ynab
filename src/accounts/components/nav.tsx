import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';
import connectedAccountsSelector from '../selector';
import { Link, useParams } from 'react-router-dom';

const Nav = () => {
  const connectedAccounts = useSelector(connectedAccountsSelector);
  const { accountId } = useParams<{ accountId?: string }>();

  return (
    <nav className="sby-accounts-nav">
      <h3>Kontoer</h3>
      {connectedAccounts.map((account) => (
        <Link key={account.compoundId} to={`/accounts/${account.compoundId}`} className={cx({ 'active': accountId === account.compoundId })}>
          {account.displayName}
        </Link>
      ))}
      {/* <li>
      + Legg til kobling
      </li> */}
    </nav>
  );
};

export default React.memo(Nav);
