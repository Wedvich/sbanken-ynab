import React, { useRef, FormEvent, useState, useCallback, ChangeEvent } from 'react';
import useFocusTrap from '../shared/use-focus-trap';
import { actions as ynabActions, YnabState } from '../ynab/reducer';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/root-reducer';
import ExternalLink from '../shared/external-link';
import OnboardingSteps from './steps';

const YnabOnboarding = () => {
  const formRef = useRef<HTMLFormElement>();
  useFocusTrap(formRef);
  const dispatch = useDispatch();
  const state = useSelector<RootState, YnabState>((state) => state.ynab);

  const [personalAccessToken, setPersonalAccessToken] = useState(state.personalAccessToken || process.env.YNAB_PERSONAL_ACCESS_TOKEN);
  const [budgetId, setBudgetId] = useState(state.budgetId || process.env.YNAB_BUDGET_ID);

  const canSubmit = personalAccessToken && budgetId;

  const onSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    dispatch(ynabActions.setToken(personalAccessToken));
    dispatch(ynabActions.setBudget(budgetId));
  }, [canSubmit, personalAccessToken, budgetId]);

  return (
    <form className="sby-onboarding" ref={formRef} onSubmit={onSubmit}>
      <h2>Sbanken → YNAB</h2>
      <h1>Koble til YNAB</h1>
      <div className="sby-onboarding-instructions">
        Du må gå til <ExternalLink href="https://app.youneedabudget.com/settings/developer">utviklerinnstillingene</ExternalLink> og opprette en Personal Access Token.
        <br />
        <br />
        Deretter finner du budsjett-ID&apos;en din i URL&apos;en når du er inne i YNAB. Eksempel:
        <br />
        <br />
        <span className="example">https://app.youneedabudget.com/<strong>aca193c6-edd5-484f-b045-b3721c46d9b6</strong>/budget</span>
      </div>
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
        />
      </div>
      <div className="sby-input-group">
        <label htmlFor="ynabBudgetId">Budsjett</label>
        <input
          type="text"
          id="ynabBudgetId"
          className="sby-text-input"
          value={budgetId}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setBudgetId(e.target.value)}
          size={32}
          autoComplete="off"
        />
      </div>
      <OnboardingSteps />
      <div className="sby-button-group">
        <button type="submit">
          <span>Fortsett</span>
        </button>
      </div>
    </form>
  );
};

export default YnabOnboarding;
