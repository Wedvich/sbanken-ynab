import { useSelector } from 'react-redux';
import type { RootState } from '..';

export const useSbankenTokenForAccountId = (accountId?: string): string | undefined => {
  const sbankenState = useSelector((state: RootState) => state.sbanken);
  const credentialId = sbankenState.credentialIdByAccountId[accountId];
  const credential = sbankenState.credentials.find((c) => c.clientId === credentialId);
  return credential?.token?.value;
};
