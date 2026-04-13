import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.scss';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

if (module.hot) {
  module.hot.accept();
}
