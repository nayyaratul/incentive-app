import React from 'react';
import { PersonaProvider } from './context/PersonaContext';
import { PersonaPill, PersonaModal } from './components/Widgets/PersonaSwitcher/PersonaSwitcher';
import RootRouter from './containers/RootRouter';

export default function App() {
  return (
    <PersonaProvider>
      <RootRouter />
      <PersonaPill />
      <PersonaModal />
    </PersonaProvider>
  );
}
