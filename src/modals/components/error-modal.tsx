import React, { useRef } from 'react';
import useFocusTrap from '../../shared/use-focus-trap';
import { actions } from '../reducer';
import { useDispatch, useSelector } from 'react-redux';
import { ModalId } from '../types';
import { RootState } from '../../store/root-reducer';
import ErrorModalDetails from './error-modal-details';

const ErrorModal = () => {
  const modalRef = useRef<HTMLDivElement>();
  useFocusTrap(modalRef);
  const dispatch = useDispatch();
  const error = useSelector((state: RootState) => state.app.lastError);

  return (
    <div className="sby-error-modal" role="dialog" ref={modalRef}>
      <header>
        <h2>Det oppsto en feil</h2>
      </header>
      <ErrorModalDetails error={error} />
      <div className="sby-button-group modal-buttons">
        <button type="button" onClick={() => dispatch(actions.closeModal(ModalId.Error))}>
          Lukk
        </button>
      </div>
    </div>
  );
};

export default React.memo(ErrorModal);
