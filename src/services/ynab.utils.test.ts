import type { YnabPayee } from './ynab.types';
import { inferPayeeIdFromDescription } from './ynab.utils';

describe('inferPayeeIdFromDescription', () => {
  const payees: Array<YnabPayee> = [
    { id: 'a', name: 'Ruter', deleted: false, transfer_account_id: null },
    { id: 'b', name: 'Spotify', deleted: true, transfer_account_id: null },
    { id: 'c', name: 'Fresh Cutz', deleted: false, transfer_account_id: null },
    { id: 'd', name: 'Coop Extra', deleted: false, transfer_account_id: null },
    { id: 'e', name: 'Coop Mega', deleted: false, transfer_account_id: null },
    { id: 'f', name: 'Rema 1000', deleted: false, transfer_account_id: null },
  ];

  it('finds the correct payee by partial match', () => {
    const payeeId = inferPayeeIdFromDescription(payees, 'Vipps*Ruter');

    expect(payeeId).toEqual('a');
  });

  it('finds the correct payee by full match', () => {
    const payeeId = inferPayeeIdFromDescription(payees, 'FRESH CUTZ');

    expect(payeeId).toEqual('c');
  });

  it('finds the correct payee by full match when there are multiple partial matches', () => {
    const payeeId = inferPayeeIdFromDescription(payees, 'Coop Extra');

    expect(payeeId).toEqual('d');
  });

  it('returns undefined when there are only multiple partial matches', () => {
    const payeeId = inferPayeeIdFromDescription(payees, 'Coop');

    expect(payeeId).toBeUndefined();
  });

  it('ignores deleted payees', () => {
    const payeeId = inferPayeeIdFromDescription(payees, 'Spotify');

    expect(payeeId).toBeUndefined();
  });

  it('matches partial payee names when there are no better matches', () => {
    const payeeId = inferPayeeIdFromDescription(payees, 'REMA LORENVEIEN');

    expect(payeeId).toEqual('f');
  });
});
