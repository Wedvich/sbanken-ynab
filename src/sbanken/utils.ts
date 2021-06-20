export const sbankenApiBaseUrl = 'https://publicapi.sbanken.no/apibeta';

export const sbankenIdentityServerUrl = 'https://auth.sbanken.no/identityserver/connect';

export const ynabApiBaseUrl = 'https://api.youneedabudget.com/v1';

export const encodeCredentials = (clientId: string, clientSecret: string) =>
  btoa(`${encodeURIComponent(clientId)}:${encodeURIComponent(clientSecret)}`);

export const decodeCredentials = (
  credentials: string
): { clientId: string; clientSecret: string } | null => {
  if (!credentials) return null;
  try {
    const [clientId, clientSecret] = atob(credentials)
      .split(':')
      .map((part) => decodeURIComponent(part));
    return {
      clientId,
      clientSecret,
    };
  } catch {
    return null;
  }
};
