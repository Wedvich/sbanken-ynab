import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';
import { Link, useParams } from 'react-router-dom';
import connectedAccountsSelector from '../selector';
import Icon from '../../shared/icon';
import checkCircleIcon from '@coreui/icons/svg/free/cil-check-circle.svg';

const Nav = () => {
  const connectedAccounts = useSelector(connectedAccountsSelector);
  const { accountId } = useParams<{ accountId?: string }>();

  return (
    <nav className="sby-accounts-nav">
      <h3>Kontoer</h3>
      {connectedAccounts.map((account) => (
        <Link key={account.compoundId} to={`/accounts/${account.compoundId}`} className={cx({ 'active': accountId === account.compoundId })}>
          {account.displayName}
          {account.diffs === null && (
            <Icon
              src={checkCircleIcon}
              title="Ingen differanse mellom Sbanken og Ynab"
            />
          )}
        </Link>
      ))}
      {/* <li>
      + Legg til kobling
      </li> */}
    </nav>
  );
};

export default React.memo(Nav);
