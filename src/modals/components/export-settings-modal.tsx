import React, { useLayoutEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actions } from '../reducer';
import { ModalId } from '../types';
import useFocusTrap from '../../shared/use-focus-trap';
import { exportSettingsSelector } from '../../app/utils';

const ExportSettingsModal = () => {
  const modalRef = useRef<HTMLDivElement>();
  useFocusTrap(modalRef);
  const dispatch = useDispatch();
  const settings = useSelector(exportSettingsSelector);

  useLayoutEffect(() => {
    const textArea = modalRef.current?.querySelector('textarea');
    textArea?.focus();
    textArea?.setSelectionRange(0, textArea.value.length);
  }, [modalRef.current]);

  return (
    <div role="dialog" ref={modalRef}>
      <header>
        <h2>Eksporter innstillinger</h2>
      </header>
      <p>Du kan kopiere teksten under for å importere innstillingene til en annen nettleser.</p>
      <p>
        <textarea readOnly rows={10} value={settings} />
      </p>
      <div className="sby-button-group modal-buttons">
        <button type="button" onClick={() => dispatch(actions.closeModal(ModalId.ExportSettings))}>
          Lukk
        </button>
      </div>
    </div>
  );
};

export default React.memo(ExportSettingsModal);
