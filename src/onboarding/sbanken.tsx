import React, { useRef, FormEvent, useState, ChangeEvent, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useFocusTrap from '../shared/use-focus-trap';
import { actions as sbankenActions, SbankenState } from '../sbanken/reducer';
import { RootState } from '../store/root-reducer';
import Loader from '../shared/loader';
import { decodeCredentials, sbankenDevPortalUrl } from '../sbanken/utils';
import ExternalLink from '../shared/external-link';
import OnboardingSteps from './steps';
import Icon, { IconType } from '../shared/icon';

const SbankenOnboarding = () => {
  const formRef = useRef<HTMLFormElement>();
  useFocusTrap(formRef);
  const dispatch = useDispatch();
  const state = useSelector<RootState, SbankenState>((state) => state.sbanken);
  const existingCredentials = decodeCredentials(state.credentials);

  const [clientId, setClientId] = useState(existingCredentials?.clientId || '');
  const [clientSecret, setClientSecret] = useState(existingCredentials?.clientSecret || '');
  const [customerId, setCustomerId] = useState(state.customerId || '');

  const validCustomerId = customerId?.length === 11;

  const canSubmit = !state.authenticating &&
    clientId &&
    clientSecret &&
    validCustomerId;

  const onSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    dispatch(sbankenActions.setCredentials(clientId, clientSecret, customerId));
  }, [canSubmit, clientId, clientSecret, customerId, dispatch]);

  return (
    <form className="sby-onboarding" ref={formRef} onSubmit={onSubmit}>
      <h2>Sbanken → YNAB</h2>
      <h1>Koble til Sbanken</h1>
      <div className="sby-onboarding-instructions">
        Du må gå til <ExternalLink href={sbankenDevPortalUrl}>Utviklerportalen</ExternalLink> og opprette en applikasjon med følgende tilganger:
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
          spellCheck={false}
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
          spellCheck={false}
        />
      </div>
      <div className="sby-input-group">
        <label htmlFor="sbankenCustomerId">Fødselsnummer</label>
        <input
          type="text"
          id="sbankenCustomerId"
          className="sby-text-input"
          value={customerId}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerId(e.target.value.replace(/\D/g, ''))}
          disabled={state.authenticating}
          size={32}
          maxLength={11}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <OnboardingSteps />
      <div className="sby-button-group">
        <button type="submit" disabled={!canSubmit}>
          {state.authenticating && <Loader inverted />}
          <span>Fortsett</span>
        </button>
      </div>
      {state.error && (
        <div className="sby-error">
          <Icon type={IconType.Error} />
          Det oppsto en feil under henting av token.
          <br />
          <br />
          Kanskje du har skrevet feil applikasjonsnøkkel eller passord?
        </div>
      )}
    </form>
  );
};

export default SbankenOnboarding;
