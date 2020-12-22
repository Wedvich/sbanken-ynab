import React, { useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cx from 'classnames';
import { RootState } from '../store/root-reducer';
import { actions } from './reducer';
import { ModalId } from './types';
import { Transition } from 'react-transition-group';
import DeleteSettingsModal from './components/delete-settings-modal';
import ExportSettingsModal from './components/export-settings-modal';
import ImportSettingsModal from './components/import-settings-modal';
import ErrorModal from './components/error-modal';
import './modals.scss';

const Modals = () => {
  const activeModal = useSelector((state: RootState) => state.modals[0]);
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    const closeHandler = (e: KeyboardEvent) => {
      if (['Esc', 'Escape'].includes(e.key)) {
        dispatch(actions.closeModal(activeModal));
      }
    };
    window.addEventListener('keydown', closeHandler);
    return () => window.removeEventListener('keydown', closeHandler);
  }, [activeModal]);

  return (
    <div
      className={cx('sby-modals-root', {
        active: activeModal,
        inactive: !activeModal,
      })}
    >
      {/* eslint-disable jsx-a11y/no-static-element-interactions */}
      {/* eslint-disable jsx-a11y/click-events-have-key-events */}
      <div
        className="sby-modal-overlay"
        onClick={() => {
          dispatch(actions.closeModal(activeModal));
        }}
      />
      {Object.values(ModalId).map((modalId) => (
        <Transition key={modalId} in={activeModal === modalId} timeout={300} unmountOnExit>
          <div className="sby-modal-content">
            {(() => {
              switch (modalId) {
                case ModalId.DeleteSettings:
                  return <DeleteSettingsModal />;
                case ModalId.ExportSettings:
                  return <ExportSettingsModal />;
                case ModalId.ImportSettings:
                  return <ImportSettingsModal />;
                case ModalId.Error:
                  return <ErrorModal />;
                default:
                  return null;
              }
            })()}
          </div>
        </Transition>
      ))}
    </div>
  );
};

export default React.memo(Modals);
