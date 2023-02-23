import { deburr } from 'lodash-es';
import type { YnabPayee } from './ynab.types';

const prepareCache = new Map<string, Array<string>>();
const prepare = (text: string, skipCache = false): Array<string> => {
  if (!skipCache && prepareCache.has(text)) return prepareCache.get(text)!;
  const parts = text.trim().toLowerCase().split(/[ *]/);
  if (!skipCache) {
    prepareCache.set(text, parts);
  }
  return parts;
};

export const inferPayeeIdFromDescription = (
  payees: Array<YnabPayee>,
  description?: string
): string | undefined => {
  if (!payees.length || !description?.length) return undefined;

  const parts = prepare(description, true);
  const activePayees = payees.filter((payee) => !payee.deleted);
  let matches = activePayees.filter((payee) => {
    const payeeName = prepare(payee.name);
    return parts.every((part) => payeeName.includes(part));
  });

  if (!matches.length) {
    matches = activePayees.filter((payee) => {
      const payeeName = prepare(deburr(payee.name));
      return parts.every((part) => payeeName.includes(part));
    });
  }

  if (!matches.length) {
    matches = activePayees.filter((payee) => {
      const payeeName = prepare(payee.name);
      return parts.some((part) => payeeName.includes(part));
    });
  }

  return matches.length === 1 ? matches[0].id : undefined;
};
