import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import cx from 'classnames';
import Nav from './components/nav';
import './accounts.scss';
import connectedAccountsSelector from './selector';
import NoAccounts from './components/no-accounts';
import SelectedAccount from './components/selected-account';

const Accounts = () => {
  const connectedAccounts = useSelector(connectedAccountsSelector);
  const { accountId } = useParams<{ accountId?: string }>();

  const noAccounts = connectedAccounts.length === 0;

  const selectedAccount = connectedAccounts.find((account) => account.compoundId === accountId);

  return (
    <div className="sby-accounts" role="main">
      <Nav />
      <div className={cx('sby-accounts-list', { 'empty': noAccounts })}>
        {noAccounts && <NoAccounts />}
        {selectedAccount && <SelectedAccount account={selectedAccount} />}
      </div>
    </div>
  );
};

export default React.memo(Accounts);
