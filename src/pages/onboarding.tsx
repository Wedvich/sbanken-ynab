import { h } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import { FocusTrap } from '@headlessui/react';
import Button from '../components/button';
import { ynabApiBaseUrl, sbankenIdentityServerUrl } from '../config';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../services';
import { putCredential, validateSbankenToken } from '../services/sbanken';
import { putToken } from '../services/ynab';
import { useHistory } from 'react-router-dom';

export function OnboardingPage() {
  const dispatch = useDispatch<AppDispatch>();
  const history = useHistory();

  const sbankenCredentials = useSelector((state: RootState) => state.sbanken.credentials);
  const ynabTokens = useSelector((state: RootState) => state.ynab.tokens);

  const hasValidConfiguration = validateSbankenToken(sbankenCredentials[0]?.token) && ynabTokens[0];

  const handleNext = useCallback(
    (e: Event) => {
      e.preventDefault();
      if (hasValidConfiguration) {
        history.replace('/');
      }
    },
    [hasValidConfiguration, history]
  );

  const [ynabPersonalAccessToken, setYnabPersonalAccessToken] = useState(ynabTokens[0] ?? '');
  const [ynabBudgets, setYnabBudgets] = useState([]);
  const [sbankenClientId, setSbankenClientId] = useState(sbankenCredentials[0]?.clientId ?? '');
  const [sbankenClientSecret, setSbankenClientSecret] = useState(
    sbankenCredentials[0]?.clientSecret ?? ''
  );
  const [sbankenToken, setSbankenToken] = useState(sbankenCredentials[0]?.token?.value ?? '');

  const fetchYnabBudgets = async () => {
    const response = await fetch(`${ynabApiBaseUrl}/budgets`, {
      headers: new Headers({
        Accept: 'application/json',
        Authorization: `Bearer ${ynabPersonalAccessToken}`,
      }),
    });

    if (!response.ok) {
      alert('bad personal access token');
    }

    const budgets = await response.json();
    setYnabBudgets(budgets.data.budgets);
    dispatch(putToken(ynabPersonalAccessToken));
  };

  const fetchSbankenToken = async () => {
    const credentials = btoa(
      `${encodeURIComponent(sbankenClientId)}:${encodeURIComponent(sbankenClientSecret)}`
    );
    const response = await fetch(sbankenIdentityServerUrl, {
      method: 'post',
      headers: new Headers({
        Accept: 'application/json',
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      }),
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      alert('bad token');
    }

    const token = await response.json();
    const parts = token.access_token.split('.');
    const decoded = JSON.parse(atob(parts[1]));
    const nbf = decoded.nbf * 1000;
    const exp = decoded.exp * 1000;
    setSbankenToken(token.access_token);
    dispatch(
      putCredential({
        clientId: sbankenClientId,
        clientSecret: sbankenClientSecret,
        token: {
          value: token.access_token,
          notBefore: nbf,
          expires: exp,
        },
      })
    );
  };

  return (
    <FocusTrap className="h-full flex items-center">
      <form className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white" onSubmit={handleNext}>
        <div className="max-w-2xl mx-auto my-8 space-y-8 divide-y divide-gray-200">
          <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div class="w-full col-span-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">You Need A Budget</h3>
              <p class="mt-1 max-w-2xl text-gray-500">
                Du må gå til{' '}
                <a
                  href="https://app.youneedabudget.com/settings/developer"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  utviklerinnstillingene
                </a>{' '}
                og opprette et Personal Access Token.
              </p>
            </div>
            <div class="sm:col-span-6">
              <label htmlFor="ynabPersonalAccessToken" class="block font-medium text-gray-700">
                Personal Access Token
              </label>
              <div class="mt-1">
                <input
                  type="password"
                  name="ynabPersonalAccessToken"
                  id="ynabPersonalAccessToken"
                  autoComplete="off"
                  class="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full border-gray-300 rounded-md"
                  value={ynabPersonalAccessToken}
                  onChange={(e: Event) =>
                    setYnabPersonalAccessToken((e.target as HTMLInputElement).value)
                  }
                />
              </div>
            </div>
            <div class="sm:col-span-6">
              {!ynabBudgets.length && (
                <Button
                  type="button"
                  className="border-transparent  text-white bg-pink-600 hover:bg-pink-700 focus:ring-pink-500"
                  onClick={fetchYnabBudgets}
                  disabled={!ynabPersonalAccessToken}
                >
                  Koble til
                </Button>
              )}
              {!!ynabBudgets.length && (
                <div class="flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg
                    class="h-6 w-6 text-green-600"
                    x-description="Heroicon name: outline/check"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
            {/* <div class="sm:col-span-3">
              <label htmlFor="ynab-budget" class="block font-medium text-gray-700">
                Budsjett
              </label>
              <div class="mt-1">
                <select
                  id="ynab-budget"
                  name="ynab-budget"
                  value={ynabBudget}
                  class="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full border-gray-300 rounded-md"
                  onChange={(e: Event) =>
                    setYnabBudget((e.target as HTMLSelectElement).value.trim())
                  }
                >
                  <option disabled value="">
                    &nbsp;
                  </option>
                  {ynabBudgets.map((budget) => (
                    <option key={budget.id} value={budget.id}>
                      {budget.name}
                    </option>
                  ))}
                </select>
              </div>
            </div> */}
          </div>
          <div class="pt-8 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div class="w-full col-span-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Sbanken</h3>
              <p class="mt-1 max-w-2xl text-gray-500">
                Du må gå til{' '}
                <a
                  href="https://secure.sbanken.no/Personal/ApiBeta/Info/"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Utviklerportalen
                </a>{' '}
                og opprette en applikasjon med tilgangen "Grants access to perform operations on
                APIBeta APIs (aka. developer portal)". Dette gir deg applikasjonsnøkkelen og
                passordet. TODO: Du kan legge til flere Sbanken-brukere, men bare ett YNAB-budsjett.
              </p>
            </div>
            <div class="sm:col-span-6">
              <label htmlFor="ynabPersonalAccessToken" class="block font-medium text-gray-700">
                Applikasjonsnøkkel
              </label>
              <div class="mt-1">
                <input
                  type="text"
                  name="sbanken-client-id"
                  id="sbanken-client-id"
                  autoComplete="off"
                  class="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full border-gray-300 rounded-md"
                  value={sbankenClientId}
                  onChange={(e: Event) =>
                    setSbankenClientId((e.target as HTMLInputElement).value.trim())
                  }
                />
              </div>
            </div>
            <div class="sm:col-span-6">
              <label htmlFor="ynabPersonalAccessToken" class="block font-medium text-gray-700">
                Passord
              </label>
              <div class="mt-1">
                <input
                  type="password"
                  name="sbanken-client-secret"
                  id="sbanken-client-secret"
                  autoComplete="off"
                  class="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full border-gray-300 rounded-md"
                  value={sbankenClientSecret}
                  onChange={(e: Event) =>
                    setSbankenClientSecret((e.target as HTMLInputElement).value.trim())
                  }
                />
              </div>
            </div>
            <div class="sm:col-span-6">
              {!sbankenToken && (
                <Button
                  type="button"
                  className="border-transparent  text-white bg-pink-600 hover:bg-pink-700 focus:ring-pink-500"
                  onClick={fetchSbankenToken}
                  disabled={!sbankenClientId || !sbankenClientSecret}
                >
                  Koble til
                </Button>
              )}
              {sbankenToken && (
                <div class="flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg
                    class="h-6 w-6 text-green-600"
                    x-description="Heroicon name: outline/check"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
          <div class="pt-8 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <Button
              type="submit"
              className="border-transparent  text-white bg-pink-600 hover:bg-pink-700 focus:ring-pink-500"
              onClick={handleNext}
              disabled={!hasValidConfiguration}
            >
              Gå videre
            </Button>
          </div>
        </div>
      </form>
    </FocusTrap>
  );
}
