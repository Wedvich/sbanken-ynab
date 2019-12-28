import React from 'react';
import { useSelector } from 'react-redux';
import './onboarding.scss';
import { RootState } from '../store/root-reducer';
import Loader from '../shared/loader';
import { SbankenState } from '../sbanken/reducer';

const AccountsOnboarding = () => {
  const {
    loading: sbankenLoading,
    accounts: sbankenAccounts,
  } = useSelector<RootState, SbankenState>((state) => state.sbanken);

  return (
    <div className="sby-onboarding" >
      <h1>Kontoer</h1>
      {sbankenLoading && <Loader />}
      {!sbankenLoading && (
        <ul className="sby-onboarding-accounts">
          {sbankenAccounts.map((account) => (
            <li key={account.accountId}>
              <h3>{account.name}</h3>
              <div>{account.accountNumber}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AccountsOnboarding;
