import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Loading from './pages/Loading';
import Gacha from './pages/Gacha';
import Congrats from './pages/Congrats';
import Dashboard from './pages/Dashboard';
import BattleSimulator from './pages/BattleSimulator';
import Leaderboards from './pages/Leaderboards';
import BattleHistory from './pages/BattleHistory';
import PaidGacha from './pages/PaidGacha';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<AuthRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/loading" element={<Loading />} />
            <Route path="/gacha" element={<ProtectedRoute><Gacha /></ProtectedRoute>} />
            <Route path="/congrats" element={<ProtectedRoute><Congrats /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/battle" element={<ProtectedRoute><BattleSimulator /></ProtectedRoute>} />
            <Route path="/leaderboards" element={<ProtectedRoute><Leaderboards /></ProtectedRoute>} />
            <Route path="/battle-history" element={<ProtectedRoute><BattleHistory /></ProtectedRoute>} />
            <Route path="/paid-gacha" element={<ProtectedRoute><PaidGacha /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return user ? children : <Navigate to="/login" />;
}

function AuthRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? "/dashboard" : "/login"} />;
}

export default App;