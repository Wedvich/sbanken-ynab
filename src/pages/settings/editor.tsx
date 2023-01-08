import { ComponentChildren, Fragment, h } from 'preact';
import { useState, useId, useCallback, useEffect } from 'preact/hooks';
import { FocusTrap } from '@headlessui/react';
import classNames from 'classnames';
import Button from '../../components/button';
import type { SbankenCredential } from '../../services/sbanken';
import type { RequestStatus } from '../../utils';

// TODO: Refactor and clean up this file, lots of duplication now

interface EditorFocusTrapProps {
  children: ComponentChildren;
  parentId: string;
  isEditing: boolean;
  stopEditing: () => void;
}

const EditorFocusTrap = ({ children, parentId, isEditing, stopEditing }: EditorFocusTrapProps) => {
  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      stopEditing();
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        (e.target instanceof HTMLElement && e.target.closest(`#${parentId}`))
      )
        return;
      stopEditing();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [parentId, isEditing, stopEditing]);

  return (
    <FocusTrap
      features={
        isEditing
          ? FocusTrap.features.InitialFocus | FocusTrap.features.TabLock
          : FocusTrap.features.None
      }
    >
      {children}
    </FocusTrap>
  );
};

interface YnabTokenEditorProps {
  fetchStatus?: RequestStatus;
  onDeleteToken?: (token: string) => void;
  onSaveToken: (token: string, originalToken?: string) => void;
  token?: string;
  tokens: Array<string>;
}

export const YnabTokenEditor = ({
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

  const canSave = !!tokenValue && !tokens.includes(tokenValue) && fetchStatus !== 'pending';

  const handleSave = useCallback(() => {
    if (!canSave) return;
    onSaveToken(tokenValue.trim(), token);
    setIsEditing(false);
  }, [canSave, onSaveToken, token, tokenValue]);

  const handleDelete = useCallback(() => {
    if (!token) return;
    onDeleteToken?.(token);
  }, [onDeleteToken, token]);

  const isEmptyState = !isEditing && !tokens.length;

  return (
    <li
      id={id}
      className={classNames({
        'py-4 px-4 sm:px-6 border border-gray-300 shadow-sm rounded': token || isEditing,
        'border-pink-600 ring-1 ring-pink-300': isEditing,
      })}
    >
      <EditorFocusTrap parentId={id} isEditing={isEditing} stopEditing={stopEditing}>
        <form
          className={classNames('relative block focus:outline-none sm:flex sm:justify-between', {
            'flex-row-reverse': isEmptyState,
          })}
          onSubmit={handleSave}
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
                  autoComplete="off"
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
          <span
            className={classNames('flex flex-col sm:flex-row text-sm gap-2 items-center', {
              'mt-2 sm:mt-0 sm:ml-6': !isEmptyState,
            })}
          >
            {!isEditing ? (
              <Fragment>
                <Button
                  key="edit"
                  className="w-full"
                  onClick={beginEditing}
                  size={!token ? 'lg' : undefined}
                  importance={!tokens.length ? 'primary' : !token ? 'secondary' : undefined}
                >
                  {token ? 'Endre' : !tokens.length ? 'Legg til token' : 'Legg til ny token'}
                </Button>
                {!!token && (
                  <Button key="remove" className="w-full" onClick={handleDelete}>
                    Fjern
                  </Button>
                )}
              </Fragment>
            ) : (
              <Fragment>
                <Button key="save" className="w-full" disabled={!canSave} onClick={handleSave}>
                  Lagre
                </Button>
                <Button key="cancel" className="w-full" onClick={stopEditing}>
                  Avbryt
                </Button>
              </Fragment>
            )}
          </span>
        </form>
      </EditorFocusTrap>
    </li>
  );
};

interface SbankenCredentialEditorProps {
  fetchStatus?: RequestStatus;
  onDeleteCredential?: (credentialId: string) => void;
  onSaveCredential: (
    credentialId: string,
    credentialSecret: string,
    originalCredentialId?: string
  ) => void;
  credential?: SbankenCredential;
  credentials: Array<SbankenCredential>;
}

export const SbankenCredentialEditor = ({
  fetchStatus,
  onDeleteCredential,
  onSaveCredential,
  credential,
  credentials,
}: SbankenCredentialEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [idValue, setIdValue] = useState(credential?.clientId);
  const [secretValue, setSecretValue] = useState(credential?.clientSecret);
  const id = useId();

  const beginEditing = () => {
    setIdValue(credential?.clientId);
    setSecretValue(credential?.clientSecret);
    setIsEditing(true);
  };

  const stopEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  const canSave =
    !!idValue &&
    !!secretValue &&
    !credentials.some((c) => c.clientId === idValue) &&
    fetchStatus !== 'pending';

  const handleSave = useCallback(() => {
    if (!canSave) return;
    onSaveCredential(idValue.trim(), secretValue.trim(), credential?.clientId);
    setIsEditing(false);
  }, [canSave, credential?.clientId, idValue, onSaveCredential, secretValue]);

  const handleDelete = useCallback(() => {
    if (!credential) return;
    onDeleteCredential?.(credential.clientId);
  }, [credential, onDeleteCredential]);

  const isEmptyState = !isEditing && !credentials.length;

  return (
    <li
      id={id}
      className={classNames({
        'py-4 px-4 sm:px-6 border border-gray-300 shadow-sm rounded': credential || isEditing,
        'border-pink-600 ring-1 ring-pink-300': isEditing,
      })}
    >
      <EditorFocusTrap parentId={id} isEditing={isEditing} stopEditing={stopEditing}>
        <form
          className={classNames('relative block focus:outline-none sm:flex sm:justify-between', {
            'flex-row-reverse': isEmptyState,
          })}
          onSubmit={handleSave}
        >
          <span className="flex items-center flex-grow">
            <span className="flex flex-col text-sm flex-grow">
              {isEditing ? (
                <Fragment>
                  <label
                    htmlFor="sbanken-client-secret"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Applikasjonsnøkkel
                  </label>
                  <input
                    id="sbanken-client-id"
                    type="text"
                    value={idValue}
                    onChange={(e) => setIdValue((e.target as HTMLInputElement).value)}
                    className="font-code bg-pink-50 m-0 border-0 border-b border-transparent leading-7 focus:border-pink-600 -mb-[1px] selection:bg-pink-300 focus:ring-0"
                    onFocus={(e) => {
                      (e.target as HTMLInputElement).select();
                    }}
                    autoComplete="off"
                  />
                  <label
                    htmlFor="sbanken-client-secret"
                    className="block text-sm font-medium text-gray-700 my-2"
                  >
                    Passord
                  </label>
                  <input
                    id="sbanken-client-secret"
                    type="password"
                    value={secretValue}
                    onChange={(e) => setSecretValue((e.target as HTMLInputElement).value)}
                    className="font-code bg-pink-50 m-0 border-0 border-b border-transparent leading-7 focus:border-pink-600 -mb-[1px] selection:bg-pink-300 focus:ring-0"
                    autoComplete="off"
                  />
                </Fragment>
              ) : (
                !!credential && (
                  <span className="font-semibold text-gray-900mr-auto">{credential.clientId}</span>
                )
              )}
              {!!credential && !isEditing && !!fetchStatus && (
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
          <span
            className={classNames('flex flex-col sm:flex-row text-sm gap-2 items-center', {
              'mt-2 sm:mt-0 sm:ml-6': !isEmptyState,
            })}
          >
            {!isEditing ? (
              <Fragment>
                <Button
                  key="edit"
                  className="w-full"
                  onClick={beginEditing}
                  size={!credential ? 'lg' : undefined}
                  importance={
                    !credentials.length ? 'primary' : !credential ? 'secondary' : undefined
                  }
                >
                  {credential
                    ? 'Endre'
                    : !credentials.length
                    ? 'Legg til applikasjonsnøkkel'
                    : 'Legg til ny applikasjonsnøkkel'}
                </Button>
                {!!credential && (
                  <Button key="remove" className="w-full" onClick={handleDelete}>
                    Fjern
                  </Button>
                )}
              </Fragment>
            ) : (
              <Fragment>
                <Button key="save" className="w-full" disabled={!canSave} onClick={handleSave}>
                  Lagre
                </Button>
                <Button key="cancel" className="w-full" onClick={stopEditing}>
                  Avbryt
                </Button>
              </Fragment>
            )}
          </span>
        </form>
      </EditorFocusTrap>
    </li>
  );
};
