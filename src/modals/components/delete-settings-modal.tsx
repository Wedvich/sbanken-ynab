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
    window.location.reload();
  };

  return (
    <div className="delete-settings-modal" role="dialog">
      <header>
        <h2>Fjern alle data?</h2>
      </header>
      <form onSubmit={onSubmit} ref={formRef}>
        <p>Dette vil permanent slette all data og innloggingsinformasjon som ligger lagret lokalt i denne appen, og sende deg tilbake til startsiden.</p>
        <p>Ingenting blir slettet i Sbanken eller You Need A Budget.</p>
        <div className="sby-button-group modal-buttons">
          <button type="button" onClick={() => dispatch(actions.closeModal(ModalId.DeleteSettings))}>Avbryt</button>
          <button type="submit" className="danger">Fjern data</button>
        </div>
      </form>
    </div>
  );
};

export default React.memo(DeleteSettingsModal);
