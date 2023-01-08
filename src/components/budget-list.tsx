import { h } from 'preact';
import { useSelector } from 'react-redux';
import { DateTime } from 'luxon';
import { getIncludedBudgets, getYnabBudgets, toggleBudget } from '../services/ynab';
import { useAppDispatch } from '../services';

export const BudgetList = () => {
  const budgets = useSelector(getYnabBudgets);
  const includedBudgets = useSelector(getIncludedBudgets);
  const dispatch = useAppDispatch();

  if (!budgets.length) {
    return <p className="text-gray-500">Ingen budsjetter ble funnet.</p>;
  }

  return (
    <ul className="mt-4">
      {budgets.map((budget) => {
        return (
          <li key={budget.id} className="-mx-4 py-2.5 hover:bg-gray-100">
            <label
              for={`budget-${budget.id}`}
              class="px-4 font-medium relative flex items-start cursor-pointer"
            >
              <span class="flex h-5 items-center">
                <input
                  id={`budget-${budget.id}`}
                  aria-describedby="comments-description"
                  name={`budget-${budget.id}`}
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 hover:bg-gray-50 text-pink-600 focus:ring-pink-500"
                  checked={includedBudgets.includes(budget.id)}
                  onChange={() => dispatch(toggleBudget(budget.id))}
                />
              </span>
              <span class="ml-3 text-sm flex-grow">
                <span class="font-medium block">{budget.name}</span>
                <span class="text-gray-500 block">
                  sist brukt{' '}
                  {DateTime.fromISO(budget.last_modified_on).toRelativeCalendar({
                    locale: 'nb',
                  })}
                </span>
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
};
