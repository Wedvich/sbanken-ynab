import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cx from 'classnames';
import { RootState } from '../store/root-reducer';
import { actions } from './reducer';
import CreateAccountModal from './components/create-account-modal';
import './modals.scss';
import { ModalId } from './types';

// TODO: react-transition-group

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
      <div className="sby-modal-content">
        {(() => {
          switch (activeModal) {
            case ModalId.CreateAccount:
              return <CreateAccountModal />;
            default:
              return null;
          }
        })()}
      </div>
    </div>
  );
};

export default React.memo(Modals);
