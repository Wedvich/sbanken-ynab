import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ConnectedAccount } from '../types';
import { actions as sbankenActions } from '../../sbanken/reducer';
import { actions as ynabActions } from '../../ynab/reducer';
import { loadingSelector } from '../../shared/utils';
import Balance from './balance';
import Loader from '../../shared/loader';
import Icon, { IconType, IconStyle } from '../../shared/icon';
import Transactions from './transactions';
import { actions } from '../reducer';
import { RootState } from '../../store/root-reducer';
import ExternalLink from '../../shared/external-link';
import AccountName from './account-name';

interface SelectedAccountProps {
  account: ConnectedAccount;
}

const SelectedAccount = ({ account }: SelectedAccountProps) => {
  const dispatch = useDispatch();
  const loading = useSelector(loadingSelector);
  const { budgetId } = useSelector((state: RootState) => state.ynab);

  return (
    <>
      <AccountName account={account} />
      <div className="sby-link-group">
        <ExternalLink href={`https://secure.sbanken.no/Home/AccountStatement?accountId=${account.sbankenId}`}>
          Åpne i Sbanken
        </ExternalLink>
        <span className="separator">&bull;</span>
        <ExternalLink href={`https://app.youneedabudget.com/${budgetId}/accounts/${account.ynabId}`}>
          Åpne i YNAB
        </ExternalLink>
      </div>
      <Balance account={account} />
      <div className="sby-button-group">
        <button onClick={() => {
          dispatch(sbankenActions.getTransactionsRequest(account.sbankenId));
          dispatch(ynabActions.getTransactionsRequest(account.ynabId));
        }} disabled={loading}>
          {loading && <Loader inverted />}
          {loading ? 'Oppdaterer' : 'Oppdater'} transaksjoner
        </button>
        <button onClick={() => {
          dispatch(sbankenActions.getAccountsRequest());
          dispatch(ynabActions.getAccountsRequest());
        }} disabled={loading}>
          {loading && <Loader inverted />}
          {loading ? 'Oppdaterer' : 'Oppdater'} saldo
        </button>
        <button className="danger" disabled={loading} onClick={() => {
          dispatch(actions.remove(account));
        }}>
          Fjern kobling
        </button>
      </div>
      {account.diffs && <Transactions />}
      {!account.diffs && (
        <h2>
          Alt ser ut til å være ajour!
          <Icon type={IconType.ThumbsUp} style={IconStyle.Solid} />
        </h2>
      )}
    </>
  );
};

export default React.memo(SelectedAccount);
