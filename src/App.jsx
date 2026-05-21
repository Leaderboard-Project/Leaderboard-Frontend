import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import Achievements from './pages/Achievements.jsx';
import Badges from './pages/Badges.jsx';
import Labs from './pages/Labs.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Leaderboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/submit" element={<Navigate to="/labs" replace />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/admin" element={<Navigate to="/leaderboard/control/admin" replace />} />
        <Route path="/leaderboard/control/admin" element={<AdminPanel />} />
      </Route>
    </Routes>
  );
}
