export const sbankenApiBaseUrl =
  process.env.SBANKEN_API_BASE_URL ?? 'https://api.sbanken.no/exec.bank/api/v1';

export const sbankenIdentityServerUrl =
  process.env.SBANKEN_IDENTITY_SERVER_URL ?? 'https://auth.sbanken.no/identityserver/connect/token';

export const ynabApiBaseUrl = process.env.YNAB_API_BASE_URL ?? 'https://api.youneedabudget.com/v1';
