import React, { useEffect, useRef, FormEvent, useState, ChangeEvent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { actions } from '../reducer';
import { ModalId } from '../types';
import useFocusTrap from '../../shared/use-focus-trap';
import { decodeSettings } from '../../app/utils';
import { actions as appActions } from '../../app/reducer';

const ImportSettingsModal = () => {
  const formRef = useRef<HTMLFormElement>();
  useFocusTrap(formRef);
  const dispatch = useDispatch();

  const [settings, setSettings] = useState('');
  const canSubmit = settings.length > 0;

  useEffect(() => {
    const textArea = formRef.current?.querySelector('textarea');
    textArea?.focus();
    textArea?.setSelectionRange(0, textArea.value.length);
  }, []);

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const importedSettings = decodeSettings(settings);
      dispatch(appActions.importSettings(importedSettings));
    },
    [dispatch, settings]
  );

  return (
    <div role="dialog">
      <header>
        <h2>Importer innstillinger</h2>
      </header>
      <form onSubmit={onSubmit} ref={formRef}>
        <p>
          Hvis du allerede har satt opp appen i en annen nettleser, kan du eksportere innstillingene
          derfra og importere dem her.
        </p>
        <p>
          <textarea
            rows={10}
            value={settings}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSettings(e.target.value)}
          />
        </p>
        <div className="sby-button-group modal-buttons">
          <button
            type="button"
            onClick={() => dispatch(actions.closeModal(ModalId.ImportSettings))}
          >
            Avbryt
          </button>
          <button type="submit" disabled={!canSubmit}>
            Importer
          </button>
        </div>
      </form>
    </div>
  );
};

export default React.memo(ImportSettingsModal);
