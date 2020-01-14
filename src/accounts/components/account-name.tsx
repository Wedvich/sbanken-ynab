import React, { useState, ChangeEvent, useLayoutEffect, useRef, useCallback, KeyboardEvent, FocusEvent } from 'react';
import { useDispatch } from 'react-redux';
import Icon, { IconType, IconStyle } from '../../shared/icon';
import { actions } from '../reducer';

import './account-name.scss';
import { ConnectedAccountSource } from '../types';

interface AccountNameProps {
  account: ConnectedAccountSource;
}

const AccountName = ({ account }: AccountNameProps) => {
  const [currentName, setCurrentName] = useState(account.displayName);
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useDispatch();
  const ref = useRef<HTMLInputElement>();

  useLayoutEffect(() => {
    if (!isEditing) {
      setCurrentName(account.displayName);
      return;
    }
    ref.current.focus();
  }, [account, ref.current, isEditing]);

  const finishEditing = useCallback((save = true) => {
    if (save && currentName.length) {
      dispatch(actions.rename(account, currentName.trim()));
    }
    setIsEditing(false);
  }, [isEditing, account, currentName]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (['Esc', 'Escape'].includes(e.key)) {
      finishEditing(false);
    } else if (e.key === 'Enter') {
      finishEditing(true);
    }
  };

  const onFocus = (e: FocusEvent<HTMLInputElement>) => {
    e.target.setSelectionRange(0, e.target.value.length);
  };

  if (!isEditing) {
    return (
      <h1 className="sby-account-name">
        <button
          title="Endre navn"
          onClick={() => setIsEditing(true)}
        >
          {currentName}
        </button>
        <Icon type={IconType.Edit} style={IconStyle.Solid} />
      </h1>
    );
  }

  return (
    <h1 className="sby-account-name sby-input-group">
      <input
        ref={ref}
        type="text"
        value={currentName}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentName(e.target.value)}
        onBlur={() => finishEditing(true)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
      />
    </h1>
  );
};

export default React.memo(AccountName);
