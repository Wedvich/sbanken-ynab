import React, { FunctionComponent, useState } from 'react';
import { connect } from 'react-redux';

import './style.scss';

import Button from '../components/button';
import TextInput from '../components/text-input';
import { unwrapClientCredentials } from '../sbanken';
import { storeOnboardingSettings } from './actions';

interface OnboardingStateProps {
  savedSbankenClientId: string;
  savedSbankenClientSecret: string;
  savedSbankenCustomerId: string;
  savedYnabAccessToken: string;
  savedYnabBudgetId: string;
}

interface OnboardingDispatchProps {
  storeOnboardingSettings: typeof storeOnboardingSettings;
}

interface OnboardingProps extends OnboardingStateProps, OnboardingDispatchProps {
  hide: Function;
}

const Onboarding: FunctionComponent<OnboardingProps> = ({
  savedSbankenClientId,
  savedSbankenClientSecret,
  savedSbankenCustomerId,
  savedYnabAccessToken,
  savedYnabBudgetId,
  storeOnboardingSettings,
  hide,
}) => {
  const [sbankenClientId, setSbankenClientId] = useState(savedSbankenClientId);
  const [sbankenClientSecret, setSbankenClientSecret] = useState(savedSbankenClientSecret);
  const [sbankenCustomerId, setSbankenCustomerId] = useState(savedSbankenCustomerId);
  const [ynabAccessToken, updateYnabAccessToken] = useState(savedYnabAccessToken);
  const [ynabBudgetId, updateYnabBudgetId] = useState(savedYnabBudgetId);

  const saveClicked = () => {
    storeOnboardingSettings(sbankenClientId, sbankenClientSecret, sbankenCustomerId, ynabAccessToken, ynabBudgetId);
    hide();
  };

  return (
    <div className="onboarding">
      <div className="onboarding__row">
        <h1>Sbanken</h1>
      </div>
      <div className="onboarding__row">
        <TextInput id="sbankenClientId" label="Client ID" value={sbankenClientId} setValue={setSbankenClientId} />
      </div>
      <div className="onboarding__row">
        <TextInput
          id="sbankenClientSecret"
          label="Client Secret"
          value={sbankenClientSecret}
          setValue={setSbankenClientSecret}
        />
      </div>
      <div className="onboarding__row">
        <TextInput
          id="sbankenCustomerId"
          label="Customer ID"
          value={sbankenCustomerId}
          setValue={setSbankenCustomerId}
        />
      </div>
      <div className="onboarding__divider" />
      <div className="onboarding__row">
        <h1>YNAB</h1>
      </div>
      <div className="onboarding__row">
        <TextInput id="ynabAccessToken" label="Access Token" value={ynabAccessToken} setValue={updateYnabAccessToken} />
      </div>
      <div className="onboarding__row">
        <TextInput id="ynabBudgetId" label="Budget ID" value={ynabBudgetId} setValue={updateYnabBudgetId} />
      </div>
      <div className="onboarding__divider" />
      <div className="onboarding__row onboarding__buttons">
        <Button onClick={saveClicked}>Lagre</Button>
        <Button onClick={() => hide()}>Lukk</Button>
      </div>
    </div>
  );
};

const mapStateToProps = (state: any): OnboardingStateProps => {
  const { clientId: savedSbankenClientId, clientSecret: savedSbankenClientSecret } = unwrapClientCredentials(
    state.sbanken.credentials
  );
  return {
    savedSbankenClientId,
    savedSbankenClientSecret,
    savedSbankenCustomerId: state.sbanken.customerId,
    savedYnabAccessToken: state.ynab.accessToken,
    savedYnabBudgetId: state.ynab.budgetId,
  };
};

const mapDispatchToProps: OnboardingDispatchProps = {
  storeOnboardingSettings,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Onboarding);
