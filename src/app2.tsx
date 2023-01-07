import { h } from 'preact';
import './app.css';
import { Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Settings } from './pages/settings';
import { fetchInitialData } from './utils';

export const App = () => {
  const dispatch = useDispatch();
  dispatch(fetchInitialData());
  return (
    <Routes>
      <Route path="*" element={<Settings />} />
    </Routes>
  );
};
