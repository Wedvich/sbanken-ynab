/* eslint-disable @typescript-eslint/camelcase */ // TODO: Remove this eslint-disable
import React, {  } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cx from 'classnames';
import { Link, useParams, useLocation } from 'react-router-dom';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import accountsSelector from '../accounts/selectors/accounts';
import { loadingSelector } from '../shared/utils';
import Loader from '../shared/loader';
import Icon, { IconType, IconSize } from '../shared/icon';
import { actions as modalActions } from '../modals/reducer';
import { ModalId } from '../modals/types';
import NavAccount from './components/account';
import { actions as accountActions } from '../accounts/reducer';

import './nav.scss';

const Nav = () => {
  const connectedAccounts = useSelector(accountsSelector);
  const { accountId } = useParams<{ accountId?: string }>();
  const loading = useSelector(loadingSelector);
  const location = useLocation();
  const dispatch = useDispatch();

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    dispatch(accountActions.reorder(result.source.index, result.destination.index));
  };

  return (
    <nav className="sby-nav">
      <h3>Kontoer</h3>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="navAccounts">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {connectedAccounts.map((account, index) => (
                <NavAccount
                  key={account.compoundId}
                  account={account}
                  active={accountId === account.compoundId}
                  index={index}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <Link
        to={'/accounts/add'}
        className={cx({ active: location.pathname === '/accounts/add'})}
      >
        <span className="label">+ Legg til kobling</span>
      </Link>
      {loading && connectedAccounts.length === 0 && (
        <div className="loading-placeholder">
          Laster inn
          <Loader />
        </div>
      )}
      <div className="sby-nav-footer">
        <button className="sby-delete-settings" title="Fjern alle data" onClick={() => {
          dispatch(modalActions.openModal(ModalId.DeleteSettings));
        }}>
          <Icon type={IconType.Trash} size={IconSize.Small} />
        </button>
      </div>
    </nav>
  );
};

export default React.memo(Nav);
