import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PersonaProvider } from './context/PersonaContext';
import { PersonaPill, PersonaModal } from './components/Widgets/PersonaSwitcher/PersonaSwitcher';
import OfflineBanner from './components/Organism/OfflineBanner/OfflineBanner';
import RootRouter from './containers/RootRouter';
import Login from './containers/Login/Login';

const useMock = process.env.REACT_APP_USE_MOCK_DATA === 'true';

function AuthGate() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', fontFamily: "'Instrument Sans', sans-serif", color: 'var(--text-muted, #595959)' }}>Loading…</div>;
  }

  if (!isAuthenticated && !useMock) {
    return <Login />;
  }

  return (
    <PersonaProvider>
      <OfflineBanner />
      <RootRouter />
      <PersonaPill />
      <PersonaModal />
    </PersonaProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
