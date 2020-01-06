import React, { FormEvent, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { actions } from '../reducer';
import { ModalId } from '../types';
import useFocusTrap from '../../shared/use-focus-trap';

const DeleteSettingsModal = () => {
  const formRef = useRef<HTMLFormElement>();
  useFocusTrap(formRef);
  const dispatch = useDispatch();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    sessionStorage.clear();
    localStorage.clear();
    window.location.reload(true);
  };

  return (
    <div className="delete-settings-modal" role="dialog">
      <header>
        <h2>Bekreft sletting</h2>
      </header>
      <form onSubmit={onSubmit} ref={formRef}>
        <p>Er du sikker på at du vil slette innstillingene? Dette vil fjerne alle tokens og data i appen.</p>
        <div className="sby-button-group modal-buttons">
          <button type="button" onClick={() => dispatch(actions.closeModal(ModalId.DeleteSettings))}>Avbryt</button>
          <button type="submit" className="danger">Slett</button>
        </div>
      </form>
    </div>
  );
};

export default React.memo(DeleteSettingsModal);
