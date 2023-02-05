import type { YnabPayee } from './ynab.types';

const prepare = (s: string) => s.trim().toLowerCase().split(/[ *]/);

export const inferPayeeIdFromDescription = (
  payees: Array<YnabPayee>,
  description?: string
): string | undefined => {
  if (!payees.length || !description?.length) return undefined;

  const parts = prepare(description);
  const matches = payees.filter((payee) => {
    if (payee.deleted) return false;
    const payeeName = prepare(payee.name);
    return payeeName.every((namePart) => parts.includes(namePart));
  });

  return matches.length === 1 ? matches[0].id : undefined;
};
