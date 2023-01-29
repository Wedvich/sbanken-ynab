/* @vitest-environment jsdom */

import undici from 'undici';
import { sbankenGetTransactionsApi } from './sbanken.api';
import { produce } from 'immer';
import { sbankenApiBaseUrl, sbankenIdentityServerUrl } from '../config';
import { createStore, RootState, store } from '.';
import {
  fetchSbankenAccounts,
  sbankenAccountsAdapter,
  SbankenCredential,
  sbankenCredentialsAdapter,
} from './sbanken';
import type { SbankenAccountWithClientId } from './sbanken.types';

const mockAgent = new undici.MockAgent();
mockAgent.disableNetConnect();
undici.setGlobalDispatcher(mockAgent);

const mockAccountId = 'abc';
const mockFromDate = '2023-01-26';

const apiUrl = new URL(sbankenApiBaseUrl);
const apiPool = mockAgent.get(apiUrl.origin);

apiPool
  .intercept({
    path: `${apiUrl.pathname}/Transactions/archive/${mockAccountId}?startDate=${mockFromDate}`,
    method: 'get',
  })
  .reply(200, {
    availableItems: 0,
    items: [],
  })
  .times(Number.MAX_SAFE_INTEGER);

apiPool
  .intercept({
    path: `${apiUrl.pathname}/Accounts`,
    method: 'get',
  })
  .reply(200, {
    availableItems: 0,
    items: [],
  })
  .times(Number.MAX_SAFE_INTEGER);

const identityUrl = new URL(sbankenIdentityServerUrl);
const identityPool = mockAgent.get(identityUrl.origin);

const nbf = 1674760281000; // 2023-01-26T19:11:21.000Z
const exp = 1674763881000; // 2023-01-26T20:11:21.000Z

const mockRefreshedToken = `.${window.btoa(
  JSON.stringify({
    nbf: nbf / 1000 + 3600,
    exp: exp / 1000 + 3600,
  })
)}.`;

identityPool
  .intercept({
    path: identityUrl.pathname,
    method: 'post',
  })
  .reply(200, {
    access_token: mockRefreshedToken,
    expires_in: 3600,
  })
  .times(Number.MAX_SAFE_INTEGER);

const initialState = produce(store.getState(), (draft: RootState) => {
  draft.sbanken.accounts = sbankenAccountsAdapter.setOne(draft.sbanken.accounts, {
    accountId: mockAccountId,
    clientId: 'def',
  } as SbankenAccountWithClientId);
  draft.sbanken.credentials = sbankenCredentialsAdapter.setOne(draft.sbanken.credentials, {
    clientId: 'def',
    clientSecret: 'ghi',
    token: {
      expires: exp,
      notBefore: nbf,
      value: '.eyX.',
    },
  } as SbankenCredential);
});

describe('getTransactions', () => {
  afterEach(() => {
    vitest.setSystemTime(vitest.getRealSystemTime());
  });

  it('refreshes token if expired before request is sent', async () => {
    vitest.setSystemTime(exp + 1);
    const testStore = createStore(true, initialState as any);
    const { isSuccess } = await testStore.dispatch(
      sbankenGetTransactionsApi.endpoints.getTransactions.initiate({
        accountId: mockAccountId,
        fromDate: mockFromDate,
      })
    );

    expect(isSuccess).toBe(true);
  });
});

describe('fetchSbankenAccounts', () => {
  it('refreshes token if expired before request is sent', async () => {
    vitest.setSystemTime(exp + 1);
    const testStore = createStore(true, initialState as any);
    const credential = sbankenCredentialsAdapter
      .getSelectors()
      .selectById(testStore.getState().sbanken.credentials, 'def')!;

    const { meta } = await testStore.dispatch(fetchSbankenAccounts(credential));

    expect(meta.requestStatus).toBe('fulfilled');
  });
});
