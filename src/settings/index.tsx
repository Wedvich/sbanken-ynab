import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Footer from '../shared/footer';
import Icon, { IconType, IconSize } from '../shared/icon';
import { actions as modalActions } from '../modals/reducer';
import { ModalId } from '../modals/types';
import SbankenSettings from './components/sbanken';
import { RootState } from '../store/root-reducer';
import { SbankenState } from '../sbanken/reducer';
import { decodeCredentials } from '../sbanken/utils';
import { actions as ynabActions, YnabState } from '../ynab/reducer';
import YnabSettings from './components/ynab';

import './settings.scss';

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const sbankenState = useSelector<RootState, SbankenState>((state) => state.sbanken);
  const existingCredentials = decodeCredentials(sbankenState.credentials);
  const ynabState = useSelector<RootState, YnabState>((state) => state.ynab);

  const initialState = useRef({
    clientId: existingCredentials?.clientId || '',
    clientSecret: existingCredentials?.clientSecret || '',
    customerId: sbankenState.customerId || '',
    personalAccessToken: ynabState.personalAccessToken || '',
    budgetId: ynabState.budgetId || '',
  });

  const [clientId, setClientId] = useState(initialState.current.clientId);
  const [clientSecret, setClientSecret] = useState(initialState.current.clientSecret);
  const [customerId, setCustomerId] = useState(initialState.current.customerId);
  const [personalAccessToken, setPersonalAccessToken] = useState(initialState.current.personalAccessToken);
  const [budgetId, setBudgetId] = useState(initialState.current.budgetId);

  const resetChanges = useCallback(() => {
    const original = initialState.current;

    setClientId(original.clientId);
    setClientSecret(original.clientSecret);
    setCustomerId(original.customerId);
    setPersonalAccessToken(original.personalAccessToken);
    setBudgetId(original.budgetId);
  }, []);

  useEffect(() => {
    if (!ynabState.budgets.length) {
      dispatch(ynabActions.getBudgetsRequest());
    }
  }, []);

  const hasChanges =
    clientId !== existingCredentials?.clientId ||
    clientSecret !== existingCredentials?.clientSecret ||
    customerId !== sbankenState.customerId ||
    personalAccessToken !== ynabState.personalAccessToken ||
    budgetId !== ynabState.budgetId;

  return (
    <div className="sby-settings" role="main">
      <div className="sby-settings-page">
        <header>
          <h1>Innstillinger</h1>
          <div className="sby-button-group">
            <Link to="/accounts">
              <button>Tilbake til kontoer</button>
            </Link>
            <button onClick={() => {
              dispatch(modalActions.openModal(ModalId.ExportSettings));
            }}>
              <Icon type={IconType.Export} size={IconSize.Small} />
              Eksporter
            </button>
            <button className="danger" onClick={() => {
              dispatch(modalActions.openModal(ModalId.DeleteSettings));
            }}>
              <Icon type={IconType.Trash} size={IconSize.Small} />
              Fjern alle data
            </button>
          </div>
        </header>
        <h2>Sbanken</h2>
        <SbankenSettings
          clientId={clientId}
          clientSecret={clientSecret}
          customerId={customerId}
          setClientId={setClientId}
          setClientSecret={setClientSecret}
          setCustomerId={setCustomerId}
        />
        <h2>You Need A Budget</h2>
        <YnabSettings
          budgetId={budgetId}
          budgets={ynabState.budgets}
          isLoading={ynabState.loading}
          personalAccessToken={personalAccessToken}
          setBudgetId={setBudgetId}
          setPersonalAccessToken={setPersonalAccessToken}
        />
        <div className="sby-button-group">
          <button disabled={!hasChanges}>Lagre endringer</button>
          <button disabled={!hasChanges} onClick={resetChanges}>Nullstill endringer</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default React.memo(Settings);
