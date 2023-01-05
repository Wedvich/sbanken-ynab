import { h } from 'preact';
import './app.css';
import { Route, Routes } from 'react-router-dom';
import { Settings } from './pages/settings';

export const App = () => {
  return (
    <Routes>
      <Route path="*" element={<Settings />} />
    </Routes>
  );
};
