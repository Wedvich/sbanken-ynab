import { h } from 'preact';
import './app.css';
import { Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Settings } from './pages/settings';
import { fetchInitialData } from './utils';
import { Layout } from './pages/layout';
import { LandingPage } from './pages/landing';
import { AccountsPage } from './pages/accounts';

export const App = () => {
  const dispatch = useDispatch();
  dispatch(fetchInitialData());

  const isUninitialized = !localStorage.length;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<AccountsPage />} />
        <Route path="innstillinger" element={<Settings />} />
      </Route>
      {isUninitialized && <Route path="*" element={<LandingPage />} />}
    </Routes>
  );
};
