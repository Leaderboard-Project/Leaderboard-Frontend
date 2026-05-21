import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Home, Moon, Orbit, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const nav = [
  ['Labs', '/labs'],
  ['Leaderboard', '/leaderboard'],
  ['Achievements', '/achievements'],
  ['Badges', '/badges']
];

export default function Layout() {
  const { admin } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const isLight = theme === 'light';

  return (
    <div className={`shell ${admin ? 'admin-shell-active' : ''}`}>
      <header className="topbar">
        <Link className="brand" to={admin ? '/admin' : '/leaderboard'}>
          <Orbit size={24} />
          <span>GitRank Labs</span>
        </Link>
        <nav>
          {admin ? (
            <NavLink to="/">
              <Home size={16} /> Home Page
            </NavLink>
          ) : (
            <>
              {nav.map(([label, path]) => (
                <NavLink key={path} to={path}>
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>
        <button
          className="theme-toggle"
          type="button"
          onClick={() => setTheme(isLight ? 'dark' : 'light')}
          aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
          title={isLight ? 'Dark mode' : 'Light mode'}
        >
          {isLight ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
