import { createSelector } from 'reselect';
import { RootState } from '../store/root-reducer';

/**
 * Recursively sorts an object by its keys.
 * @param o The object to sort.
 */
export const sortObject = <TObject>(o: TObject): TObject => {
  if (typeof o !== 'object' || Array.isArray(o) || o === null) return o;
  return Object.fromEntries(
    Object.entries(o)
      .sort(([k1], [k2]) => k1.localeCompare(k2))
      .map(([k, v]) => [k, sortObject(v)]),
  );
};

export const loadingSelector = createSelector(
  (state: RootState) => state.sbanken.loading,
  (state: RootState) => state.ynab.loading,
  (sbankenLoading, ynabLoading) => sbankenLoading || ynabLoading
);
