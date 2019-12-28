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
