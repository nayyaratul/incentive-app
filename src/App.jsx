import React from 'react';
import { PersonaProvider } from './context/PersonaContext';
import { PersonaPill, PersonaModal } from './components/Widgets/PersonaSwitcher/PersonaSwitcher';
import OfflineBanner from './components/Organism/OfflineBanner/OfflineBanner';
import RootRouter from './containers/RootRouter';

export default function App() {
  return (
    <PersonaProvider>
      <OfflineBanner />
      <RootRouter />
      <PersonaPill />
      <PersonaModal />
    </PersonaProvider>
  );
}
