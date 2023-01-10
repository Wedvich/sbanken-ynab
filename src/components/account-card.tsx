import classNames from 'classnames';
import { h, Fragment } from 'preact';
import { useMemo, useRef } from 'preact/hooks';
import { NavLink } from 'react-router-dom';
import { useDrag, useDrop } from 'react-dnd';
import { formatMoney } from '../utils';

import type { EnrichedAccount } from '../services/accounts';
import type { Identifier, XYCoord } from 'dnd-core';

interface AccountCardProps {
  account: EnrichedAccount;
  index: number;
  onDrop: () => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const itemType = 'AccountCard';

export const AccountCard = ({ account, index, onDrop, onMove }: AccountCardProps) => {
  const ref = useRef<HTMLAnchorElement>(null);

  const isAjour = useMemo(
    () =>
      account.sbankenClearedBalance === account.ynabClearedBalance &&
      account.sbankenUnclearedBalance === account.ynabUnclearedBalance &&
      account.sbankenWorkingBalance === account.ynabWorkingBalance,
    [account]
  );

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: itemType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      onMove(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
    drop: onDrop,
  });

  const [{ isDragging }, drag] = useDrag({
    type: itemType,
    item: () => {
      return { id: account.compositeId, index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <NavLink
      to={`/kontoer/${account.compositeId}`}
      className={({ isActive }) =>
        classNames('group block items-center px-2 py-2 font-medium rounded-md', {
          'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white': !isActive,
          'bg-gray-900 text-white': isActive,
        })
      }
      ref={ref}
      data-handler-id={handlerId}
      style={{ opacity: isDragging ? 0 : 1 }}
    >
      <span className="flex items-center justify-between mb-2.5">
        <span className="font-medium">{account.name}</span>
        <span className="text-sm text-gray-400">{isAjour && 'à jour'}</span>
      </span>
      <span className="grid grid-cols-[auto_1fr] items-baseline">
        <span className="text-sm text-gray-400">{isAjour ? 'Balanse' : 'Sbanken'}</span>
        <span className="text-xl font-numbers font-medium text-right tabular-nums">
          {formatMoney(account.sbankenWorkingBalance)}
        </span>
        {!isAjour && (
          <Fragment>
            <span className="text-sm text-gray-400">YNAB</span>
            <span className="text-xl font-numbers font-medium text-right tabular-nums">
              {formatMoney(account.ynabWorkingBalance)}
            </span>
          </Fragment>
        )}
      </span>
    </NavLink>
  );
};
