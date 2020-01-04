import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';
import Nav from './components/nav';
import './accounts.scss';
import accountsSelector from './selectors/accounts';
import NoAccounts from './components/no-accounts';
import SelectedAccount from './components/selected-account';
import Transactions from './components/transactions';
import { useAccountId } from './utils';

const Accounts = () => {
  const connectedAccounts = useSelector(accountsSelector);
  const accountId = useAccountId();

  const noAccounts = connectedAccounts.length === 0;

  const selectedAccount = connectedAccounts.find((account) => account.compoundId === accountId);

  return (
    <div className="sby-accounts" role="main">
      <Nav />
      <div className={cx('sby-accounts-list', { 'empty': noAccounts })}>
        {noAccounts && <NoAccounts />}
        {selectedAccount && <SelectedAccount account={selectedAccount} />}
        {selectedAccount && <Transactions />}
      </div>
    </div>
  );
};

export default React.memo(Accounts);
