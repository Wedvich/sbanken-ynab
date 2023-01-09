import { h } from 'preact';
import { Navigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../services';
import { getLinkedAccountById } from '../services/accounts';

export const TransactionsPage = () => {
  const { accountId } = useParams<{ accountId: string }>();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const account = useAppSelector((state) => getLinkedAccountById(state, accountId!));

  if (!account) {
    return <Navigate to="/kontoer" replace />;
  }

  return (
    <div className="py-10">
      <div className="max-w-5xl">
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-gray-900">{account.name}</h1>
        </div>
      </div>
    </div>
  );
};
