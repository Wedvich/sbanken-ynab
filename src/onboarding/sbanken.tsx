import React, { useRef, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useFocusTrap from '../shared/use-focus-trap';
import { actions as sbankenActions, SbankenState } from '../sbanken/reducer';
import { RootState } from '../store/root-reducer';
import Loader from '../shared/loader';
import './onboarding.scss';
import { decodeCredentials } from '../sbanken/utils';

const SbankenOnboarding = () => {
  const formRef = useRef<HTMLFormElement>();
  useFocusTrap(formRef);
  const dispatch = useDispatch();
  const state = useSelector<RootState, SbankenState>((state) => state.sbanken);
  const existingCredentials = decodeCredentials(state.credentials);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const clientId = formRef.current.querySelector<HTMLInputElement>('#sbankenClientId').value;
    const clientSecret = formRef.current.querySelector<HTMLInputElement>('#sbankenClientSecret').value;
    const customerId = formRef.current.querySelector<HTMLInputElement>('#sbankenCustomerId').value;
    dispatch(sbankenActions.setCredentials(clientId, clientSecret, customerId));
  };

  return (
    <form className="sby-onboarding" ref={formRef} onSubmit={onSubmit}>
      <h1>Sbanken</h1>
      <div className="sby-input-group">
        <label htmlFor="sbankenClientId">Applikasjonsnøkkel</label>
        <input
          type="text"
          id="sbankenClientId"
          className="sby-text-input"
          defaultValue={existingCredentials?.clientId || process.env.SBANKEN_CLIENT_ID}
          disabled={state.authenticating}
          size={32}
        />
      </div>
      <div className="sby-input-group">
        <label htmlFor="sbankenClientSecret">Passord</label>
        <input
          type="text"
          id="sbankenClientSecret"
          className="sby-text-input"
          defaultValue={existingCredentials?.clientSecret || process.env.SBANKEN_CLIENT_SECRET}
          disabled={state.authenticating}
          size={32}
        />
      </div>
      <div className="sby-input-group">
        <label htmlFor="sbankenCustomerId">Fødselsnummer</label>
        <input
          type="text"
          id="sbankenCustomerId"
          className="sby-text-input"
          defaultValue={state.customerId || process.env.SBANKEN_CUSTOMER_ID}
          disabled={state.authenticating}
          size={32}
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
