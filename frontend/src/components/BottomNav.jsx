import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Inject Pixel Font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const navItems = [
    { label: "History", icon: "📄", path: "/match-history" },
    { label: "Battle", icon: "⚔️", path: "/battle" },
    { label: "Home", icon: "🏠", path: "/dashboard" },
    { label: "Gacha", icon: "🎁", path: "/gacha" },
    { label: "Ranks", icon: "🏆", path: "/leaderboards" },
  ];

  const pixelFont = "'Press Start 2P', monospace";

  return (
    <nav style={{...styles.nav, fontFamily: pixelFont}}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        
        return (
          <div 
            key={item.label}
            style={{
              ...styles.navItem,
              ...(isActive ? styles.activeItem : {})
            }}
            onClick={() => navigate(item.path)}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span style={styles.label}>{item.label.toUpperCase()}</span>
          </div>
        );
      })}
    </nav>
  );
};

const styles = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '70px',
    background: '#f8f8f8', // Retro Screen Background
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTop: '4px solid #000', // Hard Border
    zIndex: 1000,
    boxShadow: '0 -4px 10px rgba(0,0,0,0.2)',
    paddingBottom: 'safe-area-inset-bottom', // For mobile devices
  },
  navItem: {
    textAlign: 'center',
    cursor: 'pointer',
    color: '#555',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    transition: 'all 0.1s ease',
    borderTop: '4px solid transparent', // Reserved space for active indicator
    marginTop: '-4px', // Pull up to align border
  },
  activeItem: {
    color: '#000',
    background: '#ffcb05', // Pokemon Yellow Highlight
    borderTop: '4px solid #d30a40', // Red Active Indicator
    textShadow: '1px 1px 0 #fff',
  },
  icon: {
    display: 'block',
    fontSize: '18px',
    marginBottom: '6px',
    filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.1))',
  },
  label: {
    fontSize: '8px',
    letterSpacing: '1px',
  }
};

export default BottomNav;