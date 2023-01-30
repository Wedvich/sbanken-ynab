import { Fragment, h } from 'preact';
import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../services';
import { getLinkedAccountCount } from '../services/accounts';

export const AccountsPage = () => {
  const count = useAppSelector(getLinkedAccountCount);
  return (
    <div className="py-10">
      <div className="max-w-5xl">
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-gray-900">Alle kontoer</h1>
          <p className="mt-2">
            {!count ? (
              <Fragment>
                Du har ikke lagt til noen kontoer ennå.{' '}
                <NavLink
                  to="ny"
                  className="text-pink-600 hover:text-pink-700 hover:underline underline-offset-2 inline-flex items-center gap-1"
                >
                  Legg til en konto
                </NavLink>
              </Fragment>
            ) : (
              'Velg en konto for å se transaksjonene.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
