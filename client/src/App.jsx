import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Transactions from './pages/Transactions';
import Login from './pages/Login';
import Settings from './pages/Settings';

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('stax_user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem('stax_token');
    localStorage.removeItem('stax_user');
    setUser(null);
  };

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-[#F8FAFC] overflow-hidden print:h-auto print:overflow-visible">
        <Sidebar user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-8 print:overflow-visible print:p-0">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pos" element={<POS currentUser={user} />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings currentUser={user} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
