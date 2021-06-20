import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { upsertToken } from './slice';
import { encodeCredentials, sbankenApiBaseUrl, sbankenIdentityServerUrl } from './utils';

const requiredScope = 'GW.ApiBetaCustomer';

enum SbankenTokenError {
  Unknown,
  InvalidCredentials,
  MissingScope,
  InvalidTimespan,
}

export interface SbankenAccessToken {
  token: string;
  notBefore: number;
  expires: number;
  credentials: string;
}

export const sbankenApi = createApi({
  reducerPath: 'sbankenApi',
  baseQuery: fetchBaseQuery({ baseUrl: sbankenApiBaseUrl }),
  endpoints: (builder) => ({
    getAccessToken: builder.query<SbankenAccessToken, string>({
      queryFn: async (credentials, queryApi) => {
        const tokenRequest: Partial<RequestInit> = {
          method: 'post',
          headers: new Headers({
            Accept: 'application/json',
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
          }),
          body: 'grant_type=client_credentials',
        };

        try {
          const response = await fetch(`${sbankenIdentityServerUrl}/token`, tokenRequest);
          if (!response.ok) {
            return {
              error: {
                data: SbankenTokenError.InvalidCredentials,
                status: response.status,
              },
            };
          }

          const { access_token, scope } = await response.json();
          const payload = JSON.parse(atob(access_token.split('.')[1]));

          if (!(payload.scope ?? scope).includes(requiredScope)) {
            return {
              error: {
                data: SbankenTokenError.MissingScope,
                status: response.status,
              },
            };
          }

          const accessToken: SbankenAccessToken = {
            token: access_token,
            notBefore: payload.nbf * 1000,
            expires: payload.exp * 1000,
            credentials,
          };

          const now = Date.now();
          if (accessToken.notBefore > now || accessToken.expires <= now) {
            return {
              error: {
                data: SbankenTokenError.InvalidTimespan,
                status: response.status,
              },
            };
          }

          queryApi.dispatch(upsertToken(accessToken));

          return {
            data: accessToken,
          };
        } catch {
          return {
            error: {
              data: SbankenTokenError.Unknown,
              status: 204,
            },
          };
        }
      },
    }),
  }),
});
