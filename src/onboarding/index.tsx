import React, { useRef, FormEvent } from 'react';
import useFocusTrap from '../shared/use-focus-trap';
import './onboarding.scss';

const Onboarding = () => {
  const formRef = useRef<HTMLFormElement>();
  useFocusTrap(formRef);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('submitteruuu');
  };

  return (
    <form className="sby-onboarding" ref={formRef} onSubmit={onSubmit}>
      <div className="sby-input-group">
        <label htmlFor="sbankenClientId">Applikasjonsnøkkel</label>
        <input type="text" id="sbankenClientId" className="sby-text-input" />
      </div>
      <div className="sby-input-group">
        <label htmlFor="sbankenClientSecret">Passord</label>
        <input type="text" id="sbankenClientSecret" className="sby-text-input" />
      </div>
      <div className="sby-button-group">
        <button type="submit">Fortsett</button>
      </div>
    </form>
  );
};

export default Onboarding;
