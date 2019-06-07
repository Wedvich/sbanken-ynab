import React, { FunctionComponent, useState } from 'react';
import { connect } from 'react-redux';

import TextInput from '../components/text-input';
import { unwrapClientCredentials } from '../sbanken';
import { storeOnboardingSettings } from './actions';

interface OnboardingStateProps {
  savedSbankenClientId: string;
  savedSbankenClientSecret: string;
  savedSbankenCustomerId: string;
  savedYnabAccessToken: string;
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
  storeOnboardingSettings,
  hide,
}) => {
  const [sbankenClientId, setSbankenClientId] = useState(savedSbankenClientId);
  const [sbankenClientSecret, setSbankenClientSecret] = useState(savedSbankenClientSecret);
  const [sbankenCustomerId, setSbankenCustomerId] = useState(savedSbankenCustomerId);
  const [ynabAccessToken, updateYnabAccessToken] = useState(savedYnabAccessToken);

  const saveClicked = () => {
    storeOnboardingSettings(
      sbankenClientId,
      sbankenClientSecret,
      sbankenCustomerId,
      ynabAccessToken,
    );
    hide();
  };

  return (
    <div className="onboarding">
      <div className="onboarding__row">
        <div>Sbanken</div>
        <TextInput
          id="sbankenClientId"
          label="Client ID"
          value={sbankenClientId}
          setValue={setSbankenClientId}
        />
        <TextInput
          id="sbankenClientSecret"
          label="Client Secret"
          value={sbankenClientSecret}
          setValue={setSbankenClientSecret}
        />
        <TextInput
          id="sbankenCustomerId"
          label="Customer ID"
          value={sbankenCustomerId}
          setValue={setSbankenCustomerId}
        />
      </div>
      <div className="onboarding__row">
        <div>YNAB</div>
        <TextInput
          id="ynabAccessToken"
          label="Access Token"
          value={ynabAccessToken}
          setValue={updateYnabAccessToken}
        />
      </div>
      <div className="onboarding__row">
        <button onClick={saveClicked}>Save</button>
        <button onClick={() => hide()}>Close</button>
      </div>
    </div>
  );
};

const mapStateToProps = (state: any): OnboardingStateProps =>  {
  const {
    clientId: savedSbankenClientId,
    clientSecret: savedSbankenClientSecret,
  } = unwrapClientCredentials(state.sbanken.credentials);
  return {
    savedSbankenClientId,
    savedSbankenClientSecret,
    savedSbankenCustomerId: state.sbanken.customerId,
    savedYnabAccessToken: state.ynab.accessToken,
  };
};

const mapDispatchToProps: OnboardingDispatchProps = {
  storeOnboardingSettings,
};

export default connect(mapStateToProps, mapDispatchToProps)(Onboarding);
