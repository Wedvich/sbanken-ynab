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
import Icon, { IconType } from '../shared/icon';
import { loadingSelector } from '../shared/utils';
import Loader from '../shared/loader';
import { useHistory } from 'react-router-dom';

const Accounts = () => {
  const connectedAccounts = useSelector(accountsSelector);
  const accountId = useAccountId();
  const loading = useSelector(loadingSelector);
  const history = useHistory();

  const noAccounts = connectedAccounts.length === 0;
  const selectedAccount = connectedAccounts.find((account) => account.compoundId === accountId);

  if (!noAccounts && !accountId) {
    history.push(`/accounts/${connectedAccounts[0].compoundId}`);
  }

  return (
    <div className="sby-accounts" role="main">
      <Nav />
      <div className={cx('sby-accounts-list', { 'empty': noAccounts })}>
        {noAccounts && (loading ? <Loader /> : <NoAccounts />)}
        {selectedAccount && <SelectedAccount account={selectedAccount} />}
        {selectedAccount?.diffs && <Transactions />}
        {selectedAccount && !selectedAccount.diffs && (
          <h2>
            Alt ser ut til å være ajour!
            <Icon type={IconType.Success} />
          </h2>
        )}
      </div>
    </div>
  );
};

export default React.memo(Accounts);
