import React, { useRef, FormEvent, useState, ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useFocusTrap from '../shared/use-focus-trap';
import { actions as sbankenActions, SbankenState } from '../sbanken/reducer';
import { RootState } from '../store/root-reducer';
import Loader from '../shared/loader';
import { decodeCredentials } from '../sbanken/utils';
import ExternalLink from '../shared/external-link';

const SbankenOnboarding = () => {
  const formRef = useRef<HTMLFormElement>();
  useFocusTrap(formRef);
  const dispatch = useDispatch();
  const state = useSelector<RootState, SbankenState>((state) => state.sbanken);
  const existingCredentials = decodeCredentials(state.credentials);

  const [clientId, setClientId] = useState(existingCredentials?.clientId || process.env.SBANKEN_CLIENT_ID);
  const [clientSecret, setClientSecret] = useState(existingCredentials?.clientSecret || process.env.SBANKEN_CLIENT_SECRET);
  const [customerId, setCustomerId] = useState(state.customerId || process.env.SBANKEN_CUSTOMER_ID);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(sbankenActions.setCredentials(clientId, clientSecret, customerId));
  };

  return (
    <form className="sby-onboarding" ref={formRef} onSubmit={onSubmit}>
      <h2>Sbanken → YNAB</h2>
      <h1>Sbanken</h1>
      <div className="sby-onboarding-instructions">
        Du må gå til <ExternalLink href="https://secure.sbanken.no/Personal/ApiBeta/Info/">Utviklerportalen</ExternalLink> og opprette en applikasjon med følgende tilganger:
        <ul>
          <li>Grants access to perform read operations on the Accounts service.</li>
          <li>Grants access to perform read operations on the Transactions service.</li>
        </ul>
        Dette gir deg applikasjonsnøkkelen og passordet.
      </div>
      <div className="sby-input-group">
        <label htmlFor="sbankenClientId">Applikasjonsnøkkel</label>
        <input
          type="text"
          id="sbankenClientId"
          className="sby-text-input"
          value={clientId}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setClientId(e.target.value)}
          disabled={state.authenticating}
          size={32}
          autoComplete="off"
        />
      </div>
      <div className="sby-input-group">
        <label htmlFor="sbankenClientSecret">Passord</label>
        <input
          type="text"
          id="sbankenClientSecret"
          className="sby-text-input"
          value={clientSecret}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setClientSecret(e.target.value)}
          disabled={state.authenticating}
          size={32}
          autoComplete="off"
        />
      </div>
      <div className="sby-input-group">
        <label htmlFor="sbankenCustomerId">Fødselsnummer</label>
        <input
          type="text"
          id="sbankenCustomerId"
          className="sby-text-input"
          value={customerId}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerId(e.target.value)}
          disabled={state.authenticating}
          size={32}
          autoComplete="off"
        />
      </div>
      <div className="sby-button-group">
        <button type="submit" disabled={state.authenticating}>
          {state.authenticating && <Loader inverted />}
          <span>Fortsett</span>
        </button>
      </div>
    </form>
  );
};

export default SbankenOnboarding;
