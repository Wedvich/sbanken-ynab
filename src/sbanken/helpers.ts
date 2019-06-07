export const wrapClientCredentials = (clientId: string, clientSecret: string) =>
  btoa(`${encodeURIComponent(clientId)}:${encodeURIComponent(clientSecret)}`);

export const unwrapClientCredentials = (clientCredentials: string | null) => {
  if (!clientCredentials) {
    return {
      clientId: '',
      clientSecret: '',
    };
  }
  const [clientId, clientSecret] = atob(clientCredentials).split(':').map(p => decodeURIComponent(p));
  return {
    clientId,
    clientSecret,
  };
};
