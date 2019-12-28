import React, { useRef, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useFocusTrap from '../shared/use-focus-trap';
import { actions as sbankenActions } from '../sbanken/reducer';
import { RootState } from '../store/root-reducer';
import Loader from '../shared/loader';
import './onboarding.scss';

const Onboarding = () => {
  const formRef = useRef<HTMLFormElement>();
  useFocusTrap(formRef);
  const dispatch = useDispatch();
  const authenticating = useSelector<RootState, boolean>((state) => state.sbanken.authenticating);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const clientId = formRef.current.querySelector<HTMLInputElement>('#sbankenClientId').value;
    const clientSecret = formRef.current.querySelector<HTMLInputElement>('#sbankenClientSecret').value;
    dispatch(sbankenActions.setCredentials(clientId, clientSecret));
  };

  return (
    <form className="sby-onboarding" ref={formRef} onSubmit={onSubmit}>
      <div className="sby-input-group">
        <label htmlFor="sbankenClientId">Applikasjonsnøkkel</label>
        <input
          type="text"
          id="sbankenClientId"
          className="sby-text-input"
          defaultValue={process.env.SBANKEN_CLIENT_ID}
          disabled={authenticating}
        />
      </div>
      <div className="sby-input-group">
        <label htmlFor="sbankenClientSecret">Passord</label>
        <input
          type="text"
          id="sbankenClientSecret"
          className="sby-text-input"
          defaultValue={process.env.SBANKEN_CLIENT_SECRET}
          disabled={authenticating}
        />
      </div>
      <div className="sby-button-group">
        <button type="submit" disabled={authenticating}>
          {authenticating && <Loader />}
          <span>Fortsett</span>
        </button>
      </div>
    </form>
  );
};

export default Onboarding;
