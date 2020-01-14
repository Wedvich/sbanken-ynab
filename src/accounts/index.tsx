import React, { useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';
import { useHistory, Switch, Route } from 'react-router-dom';
import Nav from '../nav';
import accountsSelector from './selectors/accounts';
import NoAccounts from './components/no-accounts';
import SelectedAccount from './components/selected-account';
import { useAccountId } from './utils';
import { loadingSelector } from '../shared/utils';
import Loader from '../shared/loader';
import AddAccount from './components/add-account';
import Footer from './components/footer';

import './accounts.scss';

const Accounts = () => {
  const connectedAccounts = useSelector(accountsSelector);
  const accountId = useAccountId();
  const loading = useSelector(loadingSelector);
  const history = useHistory();

  const noAccounts = connectedAccounts.length === 0;
  const selectedAccount = connectedAccounts.find((account) => account.compoundId === accountId);

  useLayoutEffect(() => {
    if (!noAccounts && !accountId) {
      history.push(`/accounts/${connectedAccounts[0].compoundId}`);
    }
  }, [connectedAccounts, accountId]);

  return (
    <div className="sby-accounts" role="main">
      <Nav />
      <Switch>
        <Route exact path="/accounts/add">
          <AddAccount />
        </Route>
        <Route>
          <div className={cx('sby-accounts-page', { 'empty': noAccounts })}>
            {noAccounts && (loading ? <Loader /> : <NoAccounts />)}
            {selectedAccount && <SelectedAccount account={selectedAccount} />}
          </div>
        </Route>
      </Switch>
      <Footer />
    </div>
  );
};

export default React.memo(Accounts);
