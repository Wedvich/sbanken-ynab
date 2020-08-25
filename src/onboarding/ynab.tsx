import React, { useRef, FormEvent, useState, useCallback, ChangeEvent } from 'react';
import useFocusTrap from '../shared/use-focus-trap';
import { actions as ynabActions, YnabState } from '../ynab/reducer';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/root-reducer';
import ExternalLink from '../shared/external-link';
import OnboardingSteps from './steps';
import Loader from '../shared/loader';
import Icon, { IconType } from '../shared/icon';

const YnabOnboarding = () => {
  const formRef = useRef<HTMLFormElement>();
  useFocusTrap(formRef);
  const dispatch = useDispatch();
  const state = useSelector<RootState, YnabState>((state) => state.ynab);

  const [personalAccessToken, setPersonalAccessToken] = useState(state.personalAccessToken || '');
  const [budgetId, setBudgetId] = useState(state.budgetId || '');

  const showBudgetPicker = !state.loading && !state.error && state.personalAccessToken;

  // FIXME: This feels too brittle
  const canSubmit = personalAccessToken && (!showBudgetPicker || budgetId);

  const onSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (!state.personalAccessToken || state.error) {
      dispatch(ynabActions.setToken(personalAccessToken));
    } else {
      dispatch(ynabActions.setBudget(budgetId));
    }
  }, [canSubmit, state, dispatch, personalAccessToken, budgetId]);

  return (
    <form className="sby-onboarding" ref={formRef} onSubmit={onSubmit}>
      <h2>Sbanken → YNAB</h2>
      <h1>Koble til YNAB</h1>
      <div className="sby-onboarding-instructions">
        {!showBudgetPicker && (
          <>
            Du må gå til <ExternalLink href="https://app.youneedabudget.com/settings/developer">utviklerinnstillingene</ExternalLink> og opprette et Personal Access Token.
          </>
        )}

        {showBudgetPicker && (
          <>
            Velg budsjettet du bruker i You Need A Budget.
          </>
        )}
      </div>
      <div className="sby-input-group-collection">
        <div className="sby-input-group">
          <label htmlFor="ynabPersonalAccessToken">Personal Access Token</label>
          <input
            type="text"
            id="ynabPersonalAccessToken"
            className="sby-text-input"
            value={personalAccessToken}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPersonalAccessToken(e.target.value)}
            size={32}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        {showBudgetPicker && (
          <div className="sby-input-group sby-select">
            <label htmlFor="ynabBudgetId">Budsjett</label>
            <select
              id="ynabBudgetId"
              value={budgetId}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setBudgetId(e.target.value)}
            >
              <option disabled value="">&nbsp;</option>
              {state.budgets.map((budget) => (
                <option
                  key={budget.id}
                  value={budget.id}
                >
                  {budget.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <OnboardingSteps />
      <div className="sby-button-group">
        <button type="submit" disabled={!canSubmit}>
          {state.loading && <Loader inverted />}
          <span>Fortsett</span>
        </button>
      </div>
      {state.error && (
        <div className="sby-error">
          <Icon type={IconType.Error} />
          Det oppsto en feil under tilkobling til You Need A Budget.
          <br />
          <br />
          Kanskje du har skrevet feil token?
        </div>
      )}
    </form>
  );
};

export default YnabOnboarding;
