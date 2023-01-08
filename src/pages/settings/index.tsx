import { Fragment, h } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import { Section } from './section';
import { useDispatch, useSelector } from 'react-redux';
import {
  getYnabBudgetsRequestStatus,
  getYnabTokens,
  saveToken,
  deleteToken,
} from '../../services/ynab';
import { BudgetList } from '../../components/budget-list';
import { SbankenCredentialEditor, YnabTokenEditor } from './editor';
import {
  deleteCredential,
  getSbankenCredentials,
  getSbankenTokenRequestStatus,
  saveCredential,
} from '../../services/sbanken';
import Button from '../../components/button';
import { Dialog } from '@headlessui/react';

const resetEverything = () => {
  localStorage.clear();
  window.location.href = '/';
};

export const Settings = () => {
  const tokens = useSelector(getYnabTokens);
  const credentials = useSelector(getSbankenCredentials);
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
  const ynabFetchStatuses = useSelector(getYnabBudgetsRequestStatus);

  const handleSaveCredential = useCallback(
    (clientId: string, clientSecret: string, originalClientId?: string) => {
      dispatch(saveCredential({ clientId, clientSecret, originalClientId }));
    },
    [dispatch]
  );
  const handleDeleteCredential = useCallback(
    (clientId: string) => {
      dispatch(deleteCredential(clientId));
    },
    [dispatch]
  );
  const sbankenFetchStatuses = useSelector(getSbankenTokenRequestStatus);

  const [showResetDialog, setShowResetDialog] = useState(false);

  const externalLinkIcon = (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
      <path
        d="M21 9L21 3M21 3H15M21 3L13 11M10 5H7.8C6.11984 5 5.27976 5 4.63803 5.32698C4.07354 5.6146 3.6146 6.07354 3.32698 6.63803C3 7.27976 3 8.11984 3 9.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H14.2C15.8802 21 16.7202 21 17.362 20.673C17.9265 20.3854 18.3854 19.9265 18.673 19.362C19 18.7202 19 17.8802 19 16.2V14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

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
                  className="text-pink-600 hover:text-pink-700 hover:underline underline-offset-2 inline-flex items-center gap-1"
                >
                  Personal Access Token
                  {externalLinkIcon}
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
                    fetchStatus={ynabFetchStatuses[token]}
                  />
                );
              })}
              <YnabTokenEditor onSaveToken={handleSaveToken} tokens={tokens} />
            </ul>
            {tokens.length > 0 && (
              <Fragment>
                <h3 className="mt-4 text-lg font-semibold">Budsjetter</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Du kan koble samme kontoer fra de valgte budsjettene med Sbanken-kontoer.
                </p>
                <BudgetList />
              </Fragment>
            )}
          </Section>
          <Section
            title="Sbanken"
            description={
              <Fragment>
                Du må gå til{' '}
                <a
                  href="https://secure.sbanken.no/Personal/ApiBeta/Info/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-pink-600 hover:text-pink-700 hover:underline underline-offset-2 inline-flex items-center gap-1"
                >
                  Utviklerportalen {externalLinkIcon}
                </a>{' '}
                og opprette en applikasjon med tilgangen "Grants access to perform operations on
                APIBeta APIs (aka. developer portal)". Dette gir deg en applikasjonsnøkkel og et
                passord.
              </Fragment>
            }
          >
            <ul className="space-y-4">
              {credentials.map((credential) => {
                return (
                  <SbankenCredentialEditor
                    key={credential.clientId}
                    credential={credential}
                    onSaveCredential={handleSaveCredential}
                    onDeleteCredential={handleDeleteCredential}
                    credentials={credentials}
                    fetchStatus={sbankenFetchStatuses[credential.clientId]}
                  />
                );
              })}
              <SbankenCredentialEditor
                onSaveCredential={handleSaveCredential}
                credentials={credentials}
              />
            </ul>
          </Section>
          <Section title="Andre innstillinger">
            <h3 className="text-lg font-semibold">Fjern alle data</h3>
            <p className="mt-2 text-sm text-gray-700">
              Dersom du har problemer med Sbanken → YNAB eller ikke ønsker å bruke det mer, kan du
              fjerne alle data som ligger lagret i nettleseren din.
            </p>
            <Button key="reset" className="mt-4" onClick={() => setShowResetDialog(true)}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 mr-1"
              >
                <path
                  d="M16 6V5.2C16 4.0799 16 3.51984 15.782 3.09202C15.5903 2.71569 15.2843 2.40973 14.908 2.21799C14.4802 2 13.9201 2 12.8 2H11.2C10.0799 2 9.51984 2 9.09202 2.21799C8.71569 2.40973 8.40973 2.71569 8.21799 3.09202C8 3.51984 8 4.0799 8 5.2V6M10 11.5V16.5M14 11.5V16.5M3 6H21M19 6V17.2C19 18.8802 19 19.7202 18.673 20.362C18.3854 20.9265 17.9265 21.3854 17.362 21.673C16.7202 22 15.8802 22 14.2 22H9.8C8.11984 22 7.27976 22 6.63803 21.673C6.07354 21.3854 5.6146 20.9265 5.32698 20.362C5 19.7202 5 18.8802 5 17.2V6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Fjern alle data
            </Button>
          </Section>
        </div>
      </div>
      <Dialog
        open={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        className="relative z-10"
      >
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center">
            <Dialog.Panel className="bg-white p-8 sm:rounded-lg shadow-2xl">
              <Dialog.Title className="text-lg font-semibold">Fjern alle data</Dialog.Title>
              <Dialog.Description className="mt-4">
                <p>
                  Er du sikker på at du vil slette innstillingene? Dette vil fjerne alle tokens og
                  data i appen permanent.
                </p>
                <p>Ingenting blir slettet fra YNAB eller Sbanken.</p>
              </Dialog.Description>
              <div className="mt-4 space-x-2">
                <Button onClick={resetEverything}>Fjern</Button>
                <Button onClick={() => setShowResetDialog(false)}>Avbryt</Button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
