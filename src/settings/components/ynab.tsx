import React, { ChangeEvent } from 'react';
import { YnabBudget } from '../../ynab/api';
import Loader from '../../shared/loader';

interface YnabSettingsProps {
  budgetId: string;
  budgets: YnabBudget[];
  isLoading?: boolean;
  personalAccessToken: string;
  showBudgetPicker?: boolean;

  setBudgetId: (value: string) => void;
  setPersonalAccessToken: (value: string) => void;
}

const YnabSettings: React.FC<YnabSettingsProps> = ({
  budgets,
  budgetId,
  isLoading,
  personalAccessToken,
  showBudgetPicker = true,
  setBudgetId,
  setPersonalAccessToken,
}) => (
  <div className="sby-input-group-collection">
    <div className="sby-input-group">
      <label htmlFor="ynabPersonalAccessToken">Personal Access Token</label>
      <input
        type="text"
        id="ynabPersonalAccessToken"
        className="sby-text-input"
        value={personalAccessToken}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setPersonalAccessToken(e.target.value)}
        disabled={isLoading}
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
          disabled={isLoading}
        >
          <option disabled value="">&nbsp;</option>
          {budgets.map((budget) => (
            <option
              key={budget.id}
              value={budget.id}
            >
              {budget.name}
            </option>
          ))}
        </select>
        {isLoading && (
          <div className="sby-select-loading">
            <Loader />
          </div>
        )}
      </div>
    )}
  </div>
);

export default YnabSettings;
