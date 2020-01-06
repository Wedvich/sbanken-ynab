import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cx from 'classnames';
import { RootState } from '../store/root-reducer';
import { actions } from './reducer';
import RemoveAccountModal from './components/remove-account-modal';
import { ModalId } from './types';
import { Transition } from 'react-transition-group';
import DeleteSettingsModal from './components/delete-settings-modal';
import './modals.scss';

const Modals = () => {
  const activeModal = useSelector((state: RootState) => state.modals[0]);
  const dispatch = useDispatch();

  return (
    <div className={cx('sby-modals-root', {
      active: activeModal,
      inactive: !activeModal,
    })}>
      {/* eslint-disable jsx-a11y/no-static-element-interactions */}
      {/* eslint-disable jsx-a11y/click-events-have-key-events */}
      <div className="sby-modal-overlay" onClick={() => { dispatch(actions.closeModal(activeModal)); }} />
      {Object.values(ModalId).map((modalId) => (
        <Transition
          key={modalId}
          in={activeModal === modalId}
          timeout={300}
          unmountOnExit
        >
          <div className="sby-modal-content">
            {(() => {
              switch (modalId) {
                case ModalId.RemoveAccount:
                  return <RemoveAccountModal />;
                case ModalId.DeleteSettings:
                  return <DeleteSettingsModal />;
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
