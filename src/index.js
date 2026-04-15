import React from 'react';
import { createRoot } from 'react-dom/client';
import './nexus/styles/base.css';
import './nexus/styles/tokens.scss';
import './styles/globals.scss';
import { setBrandColour } from './nexus/utils/setBrandColour';
import App from './App';

// Generate Reliance brand scale from crimson seed
setBrandColour('#BD2925');

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

if (module.hot) {
  module.hot.accept();
}
