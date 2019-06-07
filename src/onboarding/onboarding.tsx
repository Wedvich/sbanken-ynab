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

const Onboarding: FunctionComponent<OnboardingStateProps & OnboardingDispatchProps> = ({
  savedSbankenClientId,
  savedSbankenClientSecret,
  savedSbankenCustomerId,
  savedYnabAccessToken,
  storeOnboardingSettings,
}) => {
  const [sbankenClientId, setSbankenClientId] = useState(savedSbankenClientId);
  const [sbankenClientSecret, setSbankenClientSecret] = useState(savedSbankenClientSecret);
  const [sbankenCustomerId, setSbankenCustomerId] = useState(savedSbankenCustomerId);
  const [ynabAccessToken, setYnabAccessToken] = useState(savedYnabAccessToken);

  const saveClicked = () => storeOnboardingSettings(
    sbankenClientId,
    sbankenClientSecret,
    sbankenCustomerId,
    ynabAccessToken,
  );

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
          setValue={setYnabAccessToken}
        />
      </div>
      <div className="onboarding__row">
        <button onClick={saveClicked}>Save</button>
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
