import { Fragment, h } from 'preact';
import { useCallback } from 'preact/hooks';
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
        </div>
      </div>
    </div>
  );
};
