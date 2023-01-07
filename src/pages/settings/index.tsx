import { Fragment, h } from 'preact';
import { useCallback, useEffect, useId, useState } from 'preact/hooks';
import classNames from 'classnames';
import Button from '../../components/button';
import { FocusTrap } from '@headlessui/react';
import { Section } from './section';
import { useDispatch, useSelector } from 'react-redux';
import {
  getYnabBudgetsRequestStatus,
  getYnabTokens,
  saveToken,
  RequestStatus,
  getYnabBudgets,
} from '../../services/ynab';
import { DateTime } from 'luxon';

interface YnabTokenEditorProps {
  fetchStatus?: RequestStatus;
  onSaveToken: (token: string, originalToken?: string) => void;
  token?: string;
  tokens: Array<string>;
}

const YnabTokenEditor = ({ fetchStatus, onSaveToken, token, tokens }: YnabTokenEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tokenValue, setTokenValue] = useState(token);
  const id = useId();

  const beginEditing = () => {
    setTokenValue(token);
    setIsEditing(true);
  };

  const stopEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      stopEditing();
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.defaultPrevented || (e.target instanceof HTMLElement && e.target.closest(`#${id}`)))
        return;
      stopEditing();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [id, isEditing, stopEditing]);

  const canSave = !!tokenValue && !tokens.includes(tokenValue) && !fetchStatus;

  const handleSaveToken = useCallback(() => {
    if (!canSave) return;
    onSaveToken(tokenValue, token);
    setIsEditing(false);
  }, [canSave, onSaveToken, token, tokenValue]);

  const contents = (
    <Fragment>
      <span className="flex items-center flex-grow">
        <span className="flex flex-col text-sm flex-grow">
          {isEditing ? (
            <input
              type="text"
              value={tokenValue}
              onChange={(e) => setTokenValue((e.target as HTMLInputElement).value)}
              className="font-code bg-pink-50 m-0 border-0 border-b border-transparent leading-7 focus:border-pink-600 -mb-[1px] selection:bg-pink-300 focus:ring-0"
              onFocus={(e) => {
                (e.target as HTMLInputElement).select();
              }}
            />
          ) : (
            !!token && (
              <span className="font-semibold text-gray-900 group mr-auto">
                <span className="group-hover:hidden">…{token.slice(-6)}</span>
                <span className="hidden group-hover:inline">{token}</span>
              </span>
            )
          )}
          {!!token && !isEditing && !!fetchStatus && (
            <span className="text-gray-500 mt-1">
              {fetchStatus === 'pending'
                ? 'Connecting…'
                : fetchStatus === 'fulfilled'
                ? 'Connected'
                : 'Error'}
            </span>
          )}
        </span>
      </span>
      <span className="mt-2 flex flex-col sm:flex-row text-sm sm:mt-0 sm:ml-6 gap-2 items-center">
        {!isEditing ? (
          <Fragment>
            <Button
              key="edit"
              className="w-full"
              onClick={beginEditing}
              size={!token ? 'lg' : undefined}
              importance={!token ? 'primary' : undefined}
            >
              {token ? 'Endre' : 'Legg til'}
            </Button>
            {!!token && (
              <Button key="remove" className="w-full">
                Fjern
              </Button>
            )}
          </Fragment>
        ) : (
          <Fragment>
            <Button key="save" className="w-full" disabled={!canSave} onClick={handleSaveToken}>
              Lagre
            </Button>
            <Button key="cancel" className="w-full" onClick={stopEditing}>
              Avbryt
            </Button>
          </Fragment>
        )}
      </span>
    </Fragment>
  );

  return (
    <li
      id={id}
      className={classNames('relative block focus:outline-none sm:flex sm:justify-between', {
        'py-4 px-4 sm:px-6 border border-gray-300 shadow-sm rounded': token || isEditing,
        'border-pink-600 ring-1 ring-pink-300': isEditing,
      })}
    >
      <FocusTrap
        className="contents"
        features={
          isEditing
            ? FocusTrap.features.InitialFocus | FocusTrap.features.TabLock
            : FocusTrap.features.None
        }
      >
        {contents}
      </FocusTrap>
    </li>
  );
};

export const Settings = () => {
  const tokens = useSelector(getYnabTokens);
  const dispatch = useDispatch();
  const handleSaveToken = useCallback(
    (token: string, originalToken?: string) => {
      dispatch(saveToken({ token, originalToken }));
    },
    [dispatch]
  );
  const tokenFetchStatuses = useSelector(getYnabBudgetsRequestStatus);
  const budgets = useSelector(getYnabBudgets);

  return (
    <div className="py-10">
      <div className="max-w-5xl">
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-gray-900">Innstillinger</h1>
          <Section
            title="You Need A Budget"
            description={
              <Fragment>
                Legg til ett eller flere{' '}
                <a
                  href="https://app.youneedabudget.com/settings/developer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-700 hover:underline underline-offset-2"
                >
                  Personal Access Token
                </a>{' '}
                fra YNAB og velg hvilke budsjetter du vil inkludere
              </Fragment>
            }
          >
            <ul className="space-y-4">
              {tokens.map((token) => {
                return (
                  <YnabTokenEditor
                    key={token}
                    token={token}
                    onSaveToken={handleSaveToken}
                    tokens={tokens}
                    fetchStatus={tokenFetchStatuses[token]}
                  />
                );
              })}
              <YnabTokenEditor onSaveToken={handleSaveToken} tokens={tokens} />
            </ul>
            <h3 className="mt-4 text-lg font-semibold">Budsjetter</h3>
            {!budgets.length ? (
              <p className="text-gray-500 italic">Ingen Personal Access Tokens er lagt til.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {budgets.map((budget) => {
                  return (
                    <li key={budget.id} className="relative flex items-start">
                      <div class="flex h-5 items-center">
                        <input
                          id={`budget-${budget.id}`}
                          aria-describedby="comments-description"
                          name={`budget-${budget.id}`}
                          type="checkbox"
                          class="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                      </div>
                      <div class="ml-3 text-sm">
                        <label for={`budget-${budget.id}`} class="font-semibold">
                          {budget.name}
                        </label>
                        <p class="text-gray-500">
                          sist oppdatert{' '}
                          {DateTime.fromISO(budget.last_modified_on).toRelativeCalendar({
                            locale: 'nb',
                          })}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
};
