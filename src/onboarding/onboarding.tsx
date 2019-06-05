import React, { FunctionComponent, useState } from 'react';
import { connect } from 'react-redux';

import { actions as sbankenActions, api as sbankenApi, unwrapClientCredentials } from '../sbanken';
import TextInput from '../components/text-input';
import OnboardingProgress from './OnboardingProgress';

import './style.scss';

export interface OnboardingProps {
  credentials?: string;
  customerId?: string;
  getSbankenToken: typeof sbankenActions.getSbankenTokenRequest;
  loading: boolean;
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
  } = unwrapClientCredentials(credentials || '');


  const [clientId, setClientId] = useState(cachedClientId || '');
  const [clientSecret, setClientSecret] = useState(cachedClientSecret || '');
  const [customerId, setCustomerId] = useState(cachedCustomerId || '');

  const nextClicked = () => {
    getSbankenToken(clientId, clientSecret, customerId);
  };

  const getStuffClicked = async () => {
    const response = await sbankenApi.getAccounts();
    const [account] = response.data.items;
    const transactions = await sbankenApi.getTransactions(account.accountId);
    console.log(transactions.data);
  };

  return (
    <div className="onboarding">
      <div className="onboarding__row">
        <TextInput
          id="onboarding__clientId"
          label="Client ID"
          value={clientId}
          setValue={setClientId}
        />
      </div>
      <div className="onboarding__row">
        <TextInput
          id="onboarding__clientSecret"
          label="Client Secret"
          value={clientSecret}
          setValue={setClientSecret}
        />
      </div>
      <div className="onboarding__row">
        <TextInput
          id="onboarding__customerId"
          label="Customer ID"
          value={customerId}
          setValue={setCustomerId}
        />
      </div>
      <div className="onboarding__row">
        <div>
          <button onClick={nextClicked} disabled={loading}>Next</button>
          <button onClick={getStuffClicked} disabled={loading}>Get transactions</button>
        </div>
        <OnboardingProgress />
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
