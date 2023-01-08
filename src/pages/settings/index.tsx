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
  deleteToken,
} from '../../services/ynab';
import { BudgetList } from './budget-list';

interface YnabTokenEditorProps {
  fetchStatus?: RequestStatus;
  onDeleteToken?: (token: string) => void;
  onSaveToken: (token: string, originalToken?: string) => void;
  token?: string;
  tokens: Array<string>;
}

const YnabTokenEditor = ({
  fetchStatus,
  onDeleteToken,
  onSaveToken,
  token,
  tokens,
}: YnabTokenEditorProps) => {
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

  const canSave = !!tokenValue && !tokens.includes(tokenValue) && fetchStatus !== 'pending';

  const handleSaveToken = useCallback(() => {
    if (!canSave) return;
    onSaveToken(tokenValue, token);
    setIsEditing(false);
  }, [canSave, onSaveToken, token, tokenValue]);

  const handleDeleteToken = useCallback(() => {
    if (!token) return;
    onDeleteToken?.(token);
  }, [onDeleteToken, token]);

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
                  <span className="group-hover:hidden">… {token.slice(-6)}</span>
                  <span className="hidden group-hover:inline">{token}</span>
                </span>
              )
            )}
            {!!token && !isEditing && !!fetchStatus && (
              <span className="text-gray-500 flex items-center mt-1">
                {fetchStatus === 'pending' ? (
                  'Kobler til…'
                ) : fetchStatus === 'fulfilled' ? (
                  <>
                    <svg
                      className="w-4 h-4 inline-flex mr-1 text-green-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572M22 4L12 14.01L9 11.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Tilkoblet
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 inline-flex mr-1 text-red-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18 6L6 18M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Feil ved tilkobling
                  </>
                )}
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
                {token ? 'Endre' : 'Legg til token'}
              </Button>
              {!!token && (
                <Button key="remove" className="w-full" onClick={handleDeleteToken}>
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
  const handleDeleteToken = useCallback(
    (token: string) => {
      dispatch(deleteToken(token));
    },
    [dispatch]
  );
  const tokenFetchStatuses = useSelector(getYnabBudgetsRequestStatus);

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
                fra YNAB og velg hvilke budsjetter du vil inkludere.
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
                    onDeleteToken={handleDeleteToken}
                    tokens={tokens}
                    fetchStatus={tokenFetchStatuses[token]}
                  />
                );
              })}
              <YnabTokenEditor onSaveToken={handleSaveToken} tokens={tokens} />
            </ul>
            <h3 className="mt-4 text-lg font-semibold">Budsjetter</h3>
            <p className="mt-2 text-sm text-gray-700">
              Du kan koble samme kontoer fra de valgte budsjettene med Sbanken-kontoer.
            </p>
            <BudgetList />
          </Section>
        </div>
      </div>
    </div>
  );
};
