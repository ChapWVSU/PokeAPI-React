import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Don't show navbar on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <nav style={styles.navbar}>
      <div style={styles.navContent}>
        <div style={styles.logo}>
          <Link to="/dashboard" style={styles.logoLink}>
            🎮 Pokemon Arena
          </Link>
        </div>
        
        <div style={styles.navLinks}>
          <Link 
            to="/dashboard" 
            style={{
              ...styles.navLink,
              ...(location.pathname === '/dashboard' ? styles.activeLink : {})
            }}
          >
            Dashboard
          </Link>
          <Link 
            to="/battle" 
            style={{
              ...styles.navLink,
              ...(location.pathname === '/battle' ? styles.activeLink : {})
            }}
          >
            Battle Simulator
          </Link>
          <Link 
            to="/leaderboards" 
            style={{
              ...styles.navLink,
              ...(location.pathname === '/leaderboards' ? styles.activeLink : {})
            }}
          >
            Leaderboards
          </Link>
          <Link 
            to="/battle-history" 
            style={{
              ...styles.navLink,
              ...(location.pathname === '/battle-history' ? styles.activeLink : {})
            }}
          >
            Battle History
          </Link>
          <Link 
            to="/paid-gacha" 
            style={{
              ...styles.navLink,
              ...(location.pathname === '/paid-gacha' ? styles.activeLink : {})
            }}
          >
            Gacha
          </Link>
        </div>

        <div style={styles.userInfo}>
          {user && <span style={styles.username}>Welcome, {user.username}</span>}
        </div>
        <div><button onClick={logout} style={styles.logoutButton}>Logout</button></div>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    padding: '0 20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    borderBottom: '3px solid #e74c3c',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
    logoutButton: {
    background: '#ff6b6b',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
  },
  navContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    height: '60px',
  },
  logo: {
    fontSize: '1.5em',
    fontWeight: 'bold',
  },
  logoLink: {
    color: '#ecf0f1',
    textDecoration: 'none',
  },
  navLinks: {
    display: 'flex',
    gap: '20px',
  },
  navLink: {
    color: '#bdc3c7',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    transition: 'all 0.3s ease',
    fontWeight: '500',
  },
  activeLink: {
    color: '#ecf0f1',
    background: 'rgba(231, 76, 60, 0.2)',
    border: '1px solid #e74c3c',
  },
  userInfo: {
    color: '#ecf0f1',
  },
  username: {
    fontSize: '0.9em',
    opacity: 0.9,
  }
};

export default Navbar;