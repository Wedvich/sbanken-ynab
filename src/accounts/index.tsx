import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import cx from 'classnames';
import Nav from './nav';
import './accounts.scss';
import connectedAccountsSelector from './selector';
import { actions as sbankenActions } from '../sbanken/reducer';
import { actions as ynabActions } from '../ynab/reducer';
import Loader from '../shared/loader';
import { loadingSelector } from '../shared/utils';

const Accounts = () => {
  const connectedAccounts = useSelector(connectedAccountsSelector);
  const { accountId } = useParams<{ accountId?: string }>();
  const dispatch = useDispatch();
  const loading = useSelector(loadingSelector);

  const noAccounts = connectedAccounts.length === 0;

  const selectedAccount = connectedAccounts.find((account) => account.compoundId === accountId);

  return (
    <div className="sby-accounts" role="main">
      <Nav />
      <div className={cx('sby-accounts-list', { 'empty': noAccounts })}>
        {noAccounts && (<>
          <span>Du har ingen sammenkoblede kontoer ennå.</span>
          <div className="sby-button-group">
            <button>Legg til kobling</button>
          </div>
        </>)}
        {selectedAccount &&
          (
            <>
              <h1>{selectedAccount.displayName}</h1>
              <div>
              Cleared i Sbanken:
                <span className="balance">{selectedAccount.clearedBankBalance}</span>
              i Ynab:
                <span className="balance">{selectedAccount.clearedBudgetBalance}</span>
              </div>
              <div>
              Uncleared i Sbanken:
                <span className="balance">{selectedAccount.unclearedBankBalance}</span>
              i Ynab:
                <span className="balance">{selectedAccount.unclearedBudgetBalance}</span>
              </div>
              <div className="sby-button-group">
                <button onClick={() => {
                  dispatch(sbankenActions.getTransactionsRequest(selectedAccount.sbankenId));
                  dispatch(ynabActions.getTransactionsRequest(selectedAccount.ynabId));
                }} disabled={loading}>
                  {loading && <Loader inverted />}
                  {loading ? 'Henter' : 'Hent'} transaksjoner
                </button>
              </div>
            </>
          )
        }
      </div>
    </div>
  );
};

export default React.memo(Accounts);
