import React, { FunctionComponent, useState } from 'react';
import { connect } from 'react-redux';

import { actions as sbankenActions, api as sbankenApi } from '../sbanken';

import './style.css';

export interface OnboardingProps {
  credentials?: string;
  customerId?: string;
  getSbankenToken: typeof sbankenActions.getSbankenTokenRequest;
  loading: boolean;
}

const unwrapClientCredentials = (credentials?: string) => {
  if (!credentials) {
    return {
      clientId: '',
      clientSecret: '',
    };
  }

  const [clientId, clientSecret] = atob(credentials)
    .split(':')
    .map(p => decodeURIComponent(p));

  return {
    clientId,
    clientSecret,
  };
}

const Onboarding: FunctionComponent<OnboardingProps> = ({
  getSbankenToken,
  loading,
  credentials,
  customerId: cachedCustomerId,
}) => {
  const {
    clientId: cachedClientId,
    clientSecret: cachedClientSecret,
  } = unwrapClientCredentials(credentials);


  const [clientId, setClientId] = useState(cachedClientId || '');
  const [clientSecret, setClientSecret] = useState(cachedClientSecret || '');
  const [customerId, setCustomerId] = useState(cachedCustomerId || '');

  const nextClicked = () => {
    getSbankenToken(clientId, clientSecret, customerId);
  };

  const getStuffClicked = async () => {
    const response = await sbankenApi.getAccounts();
    const [account] = response.data.items;
    const transactions = await sbankenApi.getTransactions(account.accountNumber);
    console.log(transactions.data);
  };

  return (
    <div className="onboarding">
      <div className="onboarding__row">
        <label htmlFor="onboarding__clientId" className="onboarding__label">Client ID</label>
        <input
          id="onboarding__clientId"
          type="text"
          className="onboarding__input"
          defaultValue={clientId}
          onInput={e => setClientId((e.target as HTMLInputElement).value)}
        />
      </div>
      <div className="onboarding__row">
        <label htmlFor="onboarding__clientSecret" className="onboarding__label">Client Secret</label>
        <input
          id="onboarding__clientSecret"
          type="text"
          className="onboarding__input"
          defaultValue={clientSecret}
          onInput={e => setClientSecret((e.target as HTMLInputElement).value)}
        />
      </div>
      <div className="onboarding__row">
        <label htmlFor="onboarding__customerId" className="onboarding__label">Customer ID</label>
        <input
          id="onboarding__customerId"
          type="text"
          className="onboarding__input"
          defaultValue={customerId}
          onInput={e => setCustomerId((e.target as HTMLInputElement).value)}
        />
      </div>
      <div>
        <button onClick={nextClicked} disabled={loading}>Next</button>
        <button onClick={getStuffClicked} disabled={loading}>Get transactions</button>
      </div>
    </div>
  );
};

const mapStateToProps = (state: any) => ({
  credentials: state.authentication.sbanken.credentials,
  customerId: state.authentication.sbanken.customerId,
  loading: state.authentication.sbanken.loading,
});

const mapDispatchToProps = ({
  getSbankenToken: sbankenActions.getSbankenTokenRequest,
});

export default connect(mapStateToProps, mapDispatchToProps)(Onboarding);
