import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';
import { Link, useParams } from 'react-router-dom';
import { accountsSelector } from '../selectors';
import Icon from '../../shared/icon';
import balanceScaleIcon from '@coreui/icons/svg/free/cil-balance-scale.svg';

const Nav = () => {
  const connectedAccounts = useSelector(accountsSelector);
  const { accountId } = useParams<{ accountId?: string }>();

  return (
    <nav className="sby-accounts-nav">
      <h3>Kontoer</h3>
      {connectedAccounts.map((account) => (
        <Link key={account.compoundId} to={`/accounts/${account.compoundId}`} className={cx({ 'active': accountId === account.compoundId })}>
          {account.displayName}
          {account.diffs === null && (
            <Icon
              src={balanceScaleIcon}
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
