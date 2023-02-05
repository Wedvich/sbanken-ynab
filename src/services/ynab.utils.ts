import type { YnabPayee } from './ynab.types';

export const inferPayeeIdFromDescription = (
  payees: Array<YnabPayee>,
  description?: string
): string | undefined => {
  if (!payees.length || !description?.length) return undefined;

  const parts = description.toLowerCase().trim().split(' ');
  const matches = payees.filter((payee) => {
    const payeeName = payee.name.toLowerCase().trim().split(' ');
    return payeeName.every((namePart) => parts.includes(namePart));
  });

  return matches.length === 1 ? matches[0].id : undefined;
};
