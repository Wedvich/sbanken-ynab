import { h } from 'preact';
import './app.css';
import { Outlet, Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Settings } from './pages/settings';
import { fetchInitialData } from './utils';
import { Layout } from './pages/layout';
import { LandingPage } from './pages/landing';
import { AccountsPage } from './pages/accounts';
import { getYnabTokens } from './services/ynab';
import { useAppSelector } from './services';
import { useState } from 'preact/hooks';
import { AccountEditor } from './pages/account-editor';
import { TransactionsPage } from './pages/transactions';

export const App = () => {
  const dispatch = useDispatch();
  dispatch(fetchInitialData());

  const hasNoYnabTokens = useAppSelector((state) => getYnabTokens(state).length === 0);
  const [enableLandingPage, setEnableLandingPage] = useState(hasNoYnabTokens);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index={!enableLandingPage} element={<AccountsPage />} />
        <Route path="kontoer/*" element={<Outlet />}>
          <Route index element={<AccountsPage />} />
          <Route path="ny" element={<AccountEditor />} />
          <Route path=":accountId" element={<TransactionsPage />} />
          <Route path=":accountId/endre" element={<AccountEditor />} />
        </Route>
        <Route path="innstillinger" element={<Settings />} />
      </Route>
      {enableLandingPage && (
        <Route path="*" element={<LandingPage onNavigate={() => setEnableLandingPage(false)} />} />
      )}
    </Routes>
  );
};
