import React from 'react';
import { NavLink } from 'react-router-dom';
import cx from 'classnames';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import { ConnectedAccount } from '../../accounts/types';
import { getNumberClass } from '../../accounts/utils';
import { formatCurrency } from '../../localization';

interface NavAccountProps {
  account: ConnectedAccount;
  index: number;
}

const NavAccount = ({ account, index }: NavAccountProps) => {
  const hasDiffs = !!account.diffs;

  return (
    <Draggable
      draggableId={account.compoundId}
      index={index}
    >
      {(provided: DraggableProvided, snapshot) => (
        <NavLink
          to={`/accounts/${account.compoundId}`}
          className={cx('sby-nav-link', {
            'has-diffs': hasDiffs,
            'dragging': snapshot.isDragging,
          })}
          activeClassName="active"
          innerRef={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <span className="label">{account.displayName}</span>
          <div className="balance">
            <div className={getNumberClass(account.workingBankBalance)}>
              {hasDiffs && <span>Sbanken: </span>} {formatCurrency(account.workingBankBalance)}
            </div>
            {hasDiffs && (
              <div className={getNumberClass(account.workingBudgetBalance)}>
                <span>YNAB: </span> {formatCurrency(account.workingBudgetBalance)}
              </div>
            )}
          </div>
        </NavLink>
      )}
    </Draggable>
  );
};

export default React.memo(NavAccount);
