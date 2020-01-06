import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cx from 'classnames';
import { Link, useParams, useLocation } from 'react-router-dom';
import accountsSelector from '../selectors/accounts';
import { getNumberClass, formatCurrency } from '../utils';
import { loadingSelector } from '../../shared/utils';
import './nav.scss';
import Loader from '../../shared/loader';
import Icon, { IconType, IconStyle, IconSize } from '../../shared/icon';
import { actions as modalActions } from '../../modals/reducer';
import { ModalId } from '../../modals/types';

const Nav = () => {
  const connectedAccounts = useSelector(accountsSelector);
  const { accountId } = useParams<{ accountId?: string }>();
  const loading = useSelector(loadingSelector);
  const location = useLocation();
  const dispatch = useDispatch();

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
      <Link
        to={'/accounts/add'}
        className={cx({ active: location.pathname === '/accounts/add'})}
      >
        <span className="label">+ Legg til kobling</span>
      </Link>
      {loading && connectedAccounts.length === 0 && (
        <div className="loading-placeholder">
          Laster inn
          <Loader />
        </div>
      )}
      <button className="sby-delete-settings" title="Fjern alle data" onClick={() => {
        dispatch(modalActions.openModal(ModalId.DeleteSettings));
      }}>
        <Icon type={IconType.Trash} size={IconSize.Big} />
      </button>
    </nav>
  );
};

export default React.memo(Nav);
