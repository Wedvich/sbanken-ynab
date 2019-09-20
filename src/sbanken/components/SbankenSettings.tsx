import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { SbankenState } from '../../sbanken/reducer';
import { storeOnboardingSettings } from '../../onboarding/actions';
import TextInput from '../../components/text-input';
import Button from '../../components/button';

import '../../settings/style.scss';
import { unwrapClientCredentials } from '../helpers';

const SbankenSettings = () => {
  const dispatch = useDispatch();
  const state = useSelector<RootState, SbankenState>(s => s.sbanken);
  const credentials = unwrapClientCredentials(state.credentials || '');
  const [clientId, setClientId] = useState(credentials.clientId);
  const [clientSecret, setClientSecret] = useState(credentials.clientSecret);
  const [customerId, setCustomerId] = useState(state.customerId || '');

  const saveClicked = () => dispatch(storeOnboardingSettings(
    clientId,
    clientSecret,
    customerId,
    '',
    '',
  ));

  return (
    <div className="settings-page">
      <div className="title">
        <span>Sbanken</span>
        &nbsp;
        <span className="secondary">innstillinger</span>
      </div>
      <div className="main">
        <div className="setting">
          <TextInput
            id="sbanken-client-id"
            label="Applikasjonsnøkkel"
            value={clientId}
            setValue={setClientId}
          />
        </div>
        <div className="setting">
          <TextInput
            id="sbanken-client-secret"
            label="Passord"
            value={clientSecret}
            setValue={setClientSecret}
          />
        </div>
        <div className="setting">
          <TextInput
            id="sbanken-customer-id"
            label="Fødselsnummer"
            value={customerId}
            setValue={setCustomerId}
          />
        </div>
        <div className="setting">
          <Button onClick={saveClicked}>Save</Button>
        </div>
      </div>
    </div>
  );
};

export default SbankenSettings;
