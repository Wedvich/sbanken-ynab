import React, { useRef, FormEvent, useState, useCallback, ChangeEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cx from 'classnames';
import { RootState } from '../../store/root-reducer';
import accountsSelector from '../selectors/accounts';
import useFocusTrap from '../../shared/use-focus-trap';
import { ConnectedAccountSource } from '../types';
import { compareConnectedAccountSource } from '../utils';
import { actions } from '../reducer';
import { loadingSelector } from '../../shared/utils';

import './add-account.scss';

const AddAccount = () => {
  const formRef = useRef<HTMLFormElement>();
  useFocusTrap(formRef);
  const sbankenAccounts = useSelector((state: RootState) => state.sbanken.accounts);
  const ynabAccounts = useSelector((state: RootState) => state.ynab.accounts);
  const connectedAccounts = useSelector(accountsSelector);
  const dispatch = useDispatch();
  const loading = useSelector(loadingSelector);

  const [selectedSbankenAccount, setSelectedSbankenAccount] = useState(null);
  const [selectedYnabAccount, setSelectedYnabAccount] = useState(null);
  const [name, setName] = useState('');

  const connectedAccountSource: ConnectedAccountSource = {
    displayName: name,
    sbankenId: selectedSbankenAccount,
    ynabId: selectedYnabAccount,
  };

  const validConnection =
    selectedSbankenAccount &&
    selectedYnabAccount &&
    name &&
    !connectedAccounts.find((account) => compareConnectedAccountSource(account, connectedAccountSource));

  const onSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (!validConnection) return;
    dispatch(actions.add(connectedAccountSource));
    setSelectedSbankenAccount(null);
    setSelectedYnabAccount(null);
    setName('');
  }, [connectedAccountSource, validConnection]);

  return (
    <form className="sby-add-account" ref={formRef} onSubmit={onSubmit}>
      <h1>Legg til sammenkoblet konto</h1>
      <div className="account-lists">
        <ul className="account-list">
          <li className="heading">Sbanken-konto</li>
          {Object.values(sbankenAccounts).map((sbankenAccount) => {
            const key = `sbanken-${sbankenAccount.accountId}`;
            const disabled = !!connectedAccounts.find((account) => account.sbankenId === sbankenAccount.accountId);
            return (
              <li key={key}>
                <input
                  type="radio"
                  id={key}
                  name="sbanken-account"
                  disabled={disabled || loading}
                  checked={sbankenAccount.accountId === selectedSbankenAccount}
                  onChange={() => { setSelectedSbankenAccount(sbankenAccount.accountId); }}
                />
                <label htmlFor={key} className={cx({ disabled })}>
                  {sbankenAccount.name}
                </label>
              </li>
            );
          })}
        </ul>
        <ul className="account-list">
          <li className="heading">YNAB-konto</li>
          {Object.values(ynabAccounts).map((ynabAccount) => {
            const key = `ynab-${ynabAccount.id}`;
            const disabled = !!connectedAccounts.find((account) => account.ynabId === ynabAccount.id);
            return (
              <li key={key}>
                <input
                  type="radio"
                  id={key}
                  name="ynab-account"
                  disabled={disabled || loading}
                  checked={ynabAccount.id === selectedYnabAccount}
                  onChange={() => {
                    setSelectedYnabAccount(ynabAccount.id);
                    if (!name) {
                      setName(ynabAccount.name);
                    }
                  }}
                />
                <label htmlFor={key} className={cx({ disabled })}>
                  {ynabAccount.name}
                </label>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="sby-input-group">
        <label htmlFor="connectedAccountName">Navn</label>
        <input
          type="text"
          id="connectedAccountName"
          className="sby-text-input"
          placeholder="Velg et navn"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => { setName(e.target.value); }}
          size={32}
          disabled={loading}
        />
      </div>
      <div className="sby-button-group">
        <button type="submit" disabled={!validConnection || loading}>Legg til</button>
      </div>
    </form>
  );
};

export default React.memo(AddAccount);
