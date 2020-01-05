import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';
import { Link, useParams } from 'react-router-dom';
import accountsSelector from '../selectors/accounts';
import { getNumberClass, formatCurrency } from '../utils';
import { loadingSelector } from '../../shared/utils';
import './nav.scss';
import Loader from '../../shared/loader';

const Nav = () => {
  const connectedAccounts = useSelector(accountsSelector);
  const { accountId } = useParams<{ accountId?: string }>();
  const loading = useSelector(loadingSelector);

  return (
    <nav className="sby-accounts-nav">
      <h3>Kontoer</h3>
      {connectedAccounts.map((account) => {
        const hasDiffs = !!account.diffs;
        return (
          <Link
            key={account.compoundId}
            to={`/accounts/${account.compoundId}`}
            className={cx({
              'active': accountId === account.compoundId,
              'has-diffs': hasDiffs,
            })}
          >
            <span className="label">{account.displayName}</span>
            <div className="balance">
              <div className={getNumberClass(account.workingBankBalance)}>
                {hasDiffs && <span>Sbanken: </span>} {formatCurrency(account.workingBankBalance)}
              </div>
              {hasDiffs && (
                <div className={getNumberClass(account.workingBudgetBalance)}>
                  <span>YNAB: </span> {formatCurrency(account.workingBudgetBalance)}
                </div>
              )}
            </div>
          </Link>
        );
      })}
      {loading && (
        <div className="loading-placeholder">
          Laster inn
          <Loader />
        </div>
      )}
      {/* <li>
      + Legg til kobling
      </li> */}
    </nav>
  );
};

export default React.memo(Nav);
