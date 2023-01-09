import { h } from 'preact';
import { FocusTrap } from '@headlessui/react';
import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch, RootState } from '../services';
import {
  createCompositeAccountId,
  LinkedAccount,
  putAccount,
  removeAccount,
  validateLinkedAccount,
} from '../services/accounts';
import Button from './button';

export default function AccountEditor() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { accountId } = useParams();

  // TODO: Consolidate these selectors
  const linkedAccounts = useSelector((state: RootState) => state.accounts.accounts);
  const sbankenAccounts = useSelector((state: RootState) => state.sbanken.accounts);
  const ynabAccounts = useSelector((state: RootState) => state.ynab.accounts);
  const disabledSbankenAccounts = new Set(
    sbankenAccounts
      .filter((sbankenAccount) =>
        linkedAccounts.find(
          (linkedAccount) => linkedAccount.sbankenAccountId === sbankenAccount.accountId
        )
      )
      .map(({ accountId }) => accountId)
  );
  const disabledYnabAccounts = new Set(
    ynabAccounts
      .filter((ynabAccount) =>
        linkedAccounts.find((linkedAccount) => linkedAccount.ynabAccountId === ynabAccount.id)
      )
      .map(({ id }) => id)
  );

  const existingAccount = linkedAccounts.find(
    (linkedAccount) => createCompositeAccountId(linkedAccount) === accountId
  );

  const [account, setAccount] = useState<Partial<LinkedAccount>>(existingAccount ?? {});

  useEffect(() => {
    setAccount(existingAccount ?? {});
  }, [accountId, existingAccount]);

  const handleUpdate = useCallback((patch: Partial<LinkedAccount>) => {
    setAccount((account) => ({
      ...account,
      ...patch,
    }));
  }, []);

  const handleUpdateYnabAccountId = useCallback(
    (e: Event) => {
      setAccount((account) => {
        const ynabAccountId = (e.target as HTMLInputElement).value;
        return {
          ...account,
          ynabAccountId,
          name:
            account.name ||
            ynabAccounts.find((ynabAccount) => ynabAccount.id === ynabAccountId)?.name,
        };
      });
    },
    [ynabAccounts]
  );

  const handleUpdateSbankenAccountId = useCallback(
    (e: Event) => {
      setAccount((account) => {
        const sbankenAccountId = (e.target as HTMLInputElement).value;
        return {
          ...account,
          sbankenAccountId,
          name:
            account.name ||
            sbankenAccounts.find((sbankenAccount) => sbankenAccount.accountId === sbankenAccountId)
              ?.name,
        };
      });
    },
    [sbankenAccounts]
  );

  const isValid = validateLinkedAccount(account);

  const handleSave = useCallback(
    (e: Event) => {
      e.preventDefault();
      if (!isValid) return;
      dispatch(putAccount(account));
      if (!existingAccount) {
        const updatedId = createCompositeAccountId(account);
        navigate(`/accounts/${updatedId}`, { replace: true });
      }
    },
    [account, dispatch, existingAccount, isValid, navigate]
  );

  const handleRemove = useCallback(() => {
    dispatch(removeAccount(existingAccount));
    navigate('/accounts/new', { replace: true });
  }, [dispatch, existingAccount, navigate]);

  const handleCancel = useCallback(() => {
    if (existingAccount) {
      navigate(`/accounts/${accountId}`);
    } else {
      navigate('/');
    }
  }, [accountId, existingAccount, navigate]);

  return (
    <FocusTrap className="py-6">
      <form className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8" onSubmit={handleSave}>
        <h1 className="text-2xl font-semibold text-gray-900">
          {existingAccount?.name ?? 'Legg til ny konto'}
        </h1>
        <fieldset className="mt-6">
          <label htmlFor="account-name" className="font-medium text-gray-900">
            Navn
          </label>
          <div className="mt-4 space-y-4">
            <input
              type="text"
              name="account-name"
              id="account-name"
              autoComplete="off"
              className="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full border-gray-300 rounded-md"
              value={account?.name ?? ''}
              onChange={(e: Event) =>
                handleUpdate({
                  name: (e.target as HTMLInputElement).value,
                })
              }
            />
          </div>
        </fieldset>
        <fieldset className="mt-6">
          <legend className="font-medium text-gray-900">Velg Sbanken-konto</legend>
          <div className="mt-4 space-y-4">
            {sbankenAccounts.map((sbankenAccount) => {
              const disabled =
                existingAccount?.sbankenAccountId !== sbankenAccount.accountId &&
                disabledSbankenAccounts.has(sbankenAccount.accountId);
              return (
                <div key={sbankenAccount.accountId} className="flex items-center">
                  <input
                    id={`sbanken-account-${sbankenAccount.accountId}`}
                    name="sbanken-account"
                    type="radio"
                    className="focus:ring-pink-500 h-4 w-4 text-pink-600 border-gray-300 disabled:opacity-50"
                    disabled={disabled}
                    checked={account.sbankenAccountId === sbankenAccount.accountId}
                    value={sbankenAccount.accountId}
                    onChange={handleUpdateSbankenAccountId}
                  />
                  <label
                    htmlFor={`sbanken-account-${sbankenAccount.accountId}`}
                    className={classNames('ml-3 block font-medium text-gray-700 ', {
                      'text-gray-300': disabled,
                    })}
                  >
                    {sbankenAccount.name}
                  </label>
                </div>
              );
            })}
          </div>
        </fieldset>
        <fieldset className="mt-6">
          <div>
            <legend className="font-medium text-gray-900">Velg YNAB-konto</legend>
            <p className="text-sm text-gray-500">
              Kun åpne budsjettkontoer (ikke tracking eller lukkede)
            </p>
          </div>
          <div className="mt-4 space-y-4">
            {ynabAccounts.map((ynabAccount) => {
              const disabled =
                existingAccount?.ynabAccountId !== ynabAccount.id &&
                disabledYnabAccounts.has(ynabAccount.id);
              return (
                <div key={ynabAccount.id} className="flex items-center">
                  <input
                    id={`ynab-account-${ynabAccount.id}`}
                    name="ynab-account"
                    type="radio"
                    className="focus:ring-pink-500 h-4 w-4 text-pink-600 border-gray-300 disabled:opacity-50"
                    disabled={disabled}
                    checked={account.ynabAccountId === ynabAccount.id}
                    value={ynabAccount.id}
                    onChange={handleUpdateYnabAccountId}
                  />
                  <label
                    htmlFor={`ynab-account-${ynabAccount.id}`}
                    className={classNames('ml-3 block font-medium text-gray-700 ', {
                      'text-gray-300': disabled,
                    })}
                  >
                    {ynabAccount.name}
                  </label>
                </div>
              );
            })}
          </div>
        </fieldset>
        <div className="mt-6 space-x-4">
          <Button
            type="submit"
            className="border-transparent  text-white bg-pink-600 hover:bg-pink-700 focus:ring-pink-500 disabled:opacity-50"
            disabled={!isValid}
          >
            {existingAccount ? 'Lagre' : 'Legg til'}
          </Button>
          {!!existingAccount && (
            <Button
              type="button"
              className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-pink-500"
              onClick={handleRemove}
            >
              Fjern
            </Button>
          )}
          <Button
            type="button"
            className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-pink-500"
            onClick={handleCancel}
          >
            Avbryt
          </Button>
        </div>
      </form>
    </FocusTrap>
  );
}
