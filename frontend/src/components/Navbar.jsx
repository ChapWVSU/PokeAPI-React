import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  // 1. Inject Pixel Font (Safety check to ensure it loads)
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  // Don't show navbar on login page
  if (location.pathname === '/login') {
    return null;
  }

  const pixelFont = "'Press Start 2P', monospace";

  return (
    <nav style={{...styles.navbar, fontFamily: pixelFont}}>
      <div style={styles.navContent}>
        
        {/* Logo Section */}
        <div style={styles.logo}>
          <Link to="/dashboard" style={styles.logoLink}>
            <span style={{color: '#ffcb05'}}>●</span> POKE KO
          </Link>
        </div>
        
        {/* Navigation Links */}
        <div style={styles.navLinks}>
          <Link 
            to="/dashboard" 
            style={{
              ...styles.navLink,
              ...(location.pathname === '/dashboard' ? styles.activeLink : {})
            }}
          >
            DASHBOARD
          </Link>
          <Link 
            to="/battle" 
            style={{
              ...styles.navLink,
              ...(location.pathname === '/battle' ? styles.activeLink : {})
            }}
          >
            BATTLE
          </Link>
          <Link 
            to="/leaderboards" 
            style={{
              ...styles.navLink,
              ...(location.pathname === '/leaderboards' ? styles.activeLink : {})
            }}
          >
            RANKING
          </Link>
          <Link 
            to="/battle-history" 
            style={{
              ...styles.navLink,
              ...(location.pathname === '/battle-history' ? styles.activeLink : {})
            }}
          >
            HISTORY
          </Link>
          <Link 
            to="/paid-gacha" 
            style={{
              ...styles.navLink,
              ...(location.pathname === '/paid-gacha' ? styles.activeLink : {})
            }}
          >
            GACHA
          </Link>
        </div>

        {/* User Info & Logout */}
        <div style={styles.rightSection}>
          <div style={styles.userInfo}>
            {user && <span style={styles.username}>ID: {user.username?.toUpperCase()}</span>}
          </div>
          <button onClick={logout} style={{...styles.logoutButton, fontFamily: pixelFont}}>
            LOGOUT
          </button>
        </div>

      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    background: '#fff',
    borderBottom: '4px solid #000',
    padding: '10px 0',
    width: '100%',
    marginBottom: '20px',
  },
  navContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  
  // Logo Styles
  logo: {
    fontSize: '12px',
    fontWeight: 'bold',
    textShadow: '2px 2px 0 #ddd',
  },
  logoLink: {
    color: '#000',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },

  // Link Styles
  navLinks: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  navLink: {
    color: '#555',
    textDecoration: 'none',
    padding: '8px 10px',
    fontSize: '8px',
    border: '2px solid transparent',
    transition: 'all 0.2s ease',
  },
  activeLink: {
    color: '#000',
    border: '2px solid #000',
    background: '#ffcb05', // Pokemon Yellow highlight
    boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
  },

  // Right Section
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  userInfo: {
    color: '#000',
    fontSize: '8px',
  },
  username: {
    borderBottom: '2px solid #ddd',
    paddingBottom: '2px',
  },
  logoutButton: {
    background: '#ff6b6b',
    color: '#fff',
    border: '2px solid #000',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '8px',
    boxShadow: '2px 2px 0 #000',
    textTransform: 'uppercase',
  },
};

export default Navbar;