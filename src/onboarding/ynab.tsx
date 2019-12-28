import React, { useRef, FormEvent } from 'react';
import useFocusTrap from '../shared/use-focus-trap';
import { actions as ynabActions } from '../ynab/reducer';
import { useDispatch } from 'react-redux';

const YnabOnboarding = () => {
  const formRef = useRef<HTMLFormElement>();
  useFocusTrap(formRef);
  const dispatch = useDispatch();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const personalAccessToken = formRef.current.querySelector<HTMLInputElement>('#ynabPersonalAccessToken').value;
    const budgetId = formRef.current.querySelector<HTMLInputElement>('#ynabBudgetId').value;
    dispatch(ynabActions.setToken(personalAccessToken));
    dispatch(ynabActions.setBudget(budgetId));
  };

  return (
    <form className="sby-onboarding" ref={formRef} onSubmit={onSubmit}>
      <h1>YNAB</h1>
      <div className="sby-input-group">
        <label htmlFor="ynabPersonalAccessToken">Personal Access Token</label>
        <input
          type="text"
          id="ynabPersonalAccessToken"
          className="sby-text-input"
          defaultValue={process.env.YNAB_PERSONAL_ACCESS_TOKEN}
        />
      </div>
      <div className="sby-input-group">
        <label htmlFor="ynabBudgetId">Budsjett</label>
        <input
          type="text"
          id="ynabBudgetId"
          className="sby-text-input"
          defaultValue={process.env.YNAB_BUDGET_ID}
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
