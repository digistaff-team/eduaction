import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { CourseGenerator } from './CourseGenerator';
import { CourseManager } from './CourseManager';
import { Icons } from './Icons';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'generate' | 'manage'>('generate');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError('Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-overlay">
        <div className="admin-modal">
          <div className="admin-header">
            <h2>🔐 Вход в админ-панель</h2>
            <button onClick={onClose} className="icon-btn">
              <Icons.X />
            </button>
          </div>

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="form-group">
              <label>Email администратора:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@eduaction.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Пароль:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-overlay">
      <div className="admin-modal large">
        <div className="admin-header">
          <h2>⚙️ Панель администратора</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={onClose} className="icon-btn">
              <Icons.X />
            </button>
          </div>
        </div>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            <Icons.Sparkles /> Создать курс с AI
          </button>
          <button
            className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            <Icons.Book /> Управление курсами
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'generate' ? <CourseGenerator /> : <CourseManager />}
        </div>
      </div>
    </div>
  );
};
