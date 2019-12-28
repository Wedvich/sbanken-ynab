import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/root-reducer';
import Loader from '../shared/loader';
import { SbankenState } from '../sbanken/reducer';
import { YnabState } from '../ynab/reducer';
import './onboarding.scss';

const AccountsOnboarding = () => {
  const {
    loading: sbankenLoading,
    accounts: sbankenAccounts,
  } = useSelector<RootState, SbankenState>((state) => state.sbanken);

  const {
    loading: ynabLoading,
    accounts: ynabAccounts,
  } = useSelector<RootState, YnabState>((state) => state.ynab);

  return (
    <div className="sby-onboarding" >
      <h1>Kontoer</h1>
      <div className="sby-onboarding-account-lists">
        <div className="sby-onboarding-account-list">
          <h2>Sbanken</h2>
          {sbankenLoading && <Loader />}
          {!sbankenLoading && (
            <ul className="sby-onboarding-accounts">
              {sbankenAccounts.map((account) => (
                <li key={account.accountId}>
                  <h3>{account.name}</h3>
                  <div className="account-id">{account.accountNumber}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="sby-onboarding-account-list">
          <h2>YNAB</h2>
          {ynabLoading && <Loader />}
          {!ynabLoading && (
            <ul className="sby-onboarding-accounts">
              {ynabAccounts.map((account) => (
                <li key={account.id}>
                  <h3>{account.name}</h3>
                  <div className="account-id">{account.id}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(AccountsOnboarding);
