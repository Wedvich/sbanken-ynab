import React, { useRef, FormEvent } from 'react';
import useFocusTrap from '../shared/use-focus-trap';
import { actions as ynabActions, YnabState } from '../ynab/reducer';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/root-reducer';
import ExternalLink from '../shared/external-link';

const YnabOnboarding = () => {
  const formRef = useRef<HTMLFormElement>();
  useFocusTrap(formRef);
  const dispatch = useDispatch();
  const state = useSelector<RootState, YnabState>((state) => state.ynab);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const personalAccessToken = formRef.current.querySelector<HTMLInputElement>('#ynabPersonalAccessToken').value;
    const budgetId = formRef.current.querySelector<HTMLInputElement>('#ynabBudgetId').value;
    dispatch(ynabActions.setToken(personalAccessToken));
    dispatch(ynabActions.setBudget(budgetId));
  };

  return (
    <form className="sby-onboarding" ref={formRef} onSubmit={onSubmit}>
      <h2>Sbanken → YNAB</h2>
      <h1>You Need A Budget</h1>
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
          defaultValue={state.personalAccessToken || process.env.YNAB_PERSONAL_ACCESS_TOKEN}
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
          defaultValue={state.budgetId || process.env.YNAB_BUDGET_ID}
          size={32}
          autoComplete="off"
        />
      </div>
      <div className="sby-button-group">
        <button type="submit">
          <span>Fortsett</span>
        </button>
      </div>
    </form>
  );
};

export default YnabOnboarding;
