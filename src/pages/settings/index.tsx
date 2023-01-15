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
import Icons from '../../components/icons';

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
                  <Icons.ExternalLink />
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
                  Utviklerportalen <Icons.ExternalLink />
                </a>{' '}
                og opprette en applikasjon med tilgangen &ldquot;Grants access to perform operations
                on APIBeta APIs (aka. developer portal)&rdquot;. Dette gir deg en applikasjonsnøkkel
                og et passord.
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
              <Icons.Delete className="mr-1" />
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
