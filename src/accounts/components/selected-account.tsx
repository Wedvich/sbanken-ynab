import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ConnectedAccount } from '../types';
import { actions as sbankenActions } from '../../sbanken/reducer';
import { actions as ynabActions } from '../../ynab/reducer';
import { loadingSelector } from '../../shared/utils';
import Balance from './balance';
import Loader from '../../shared/loader';

interface SelectedAccountProps {
  account: ConnectedAccount;
}

const SelectedAccount = ({ account }: SelectedAccountProps) => {
  const dispatch = useDispatch();
  const loading = useSelector(loadingSelector);

  return (
    <>
      <h1>{account.displayName}</h1>
      <Balance account={account} />
      <div className="sby-button-group">
        <button onClick={() => {
          dispatch(sbankenActions.getTransactionsRequest(account.sbankenId));
          dispatch(ynabActions.getTransactionsRequest(account.ynabId));
        }} disabled={loading}>
          {loading && <Loader inverted />}
          {loading ? 'Henter' : 'Hent'} transaksjoner
        </button>
        <button onClick={() => {
          dispatch(sbankenActions.getAccountsRequest());
          dispatch(ynabActions.getAccountsRequest());
        }} disabled={loading}>
          {loading && <Loader inverted />}
          {loading ? 'Oppdater' : 'Oppdaterer'} konto
        </button>
      </div>
    </>
  );
};

export default React.memo(SelectedAccount);
