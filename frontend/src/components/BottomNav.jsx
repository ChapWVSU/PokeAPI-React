import React from 'react';
import { useNavigate } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();

  const navItems = [
    { label: "History", icon: "📄", path: "/match-history" },
    { label: "Battle", icon: "⚔️", path: "/battle" },
    { label: "Home", icon: "🏠", path: "/dashboard" },
    { label: "Gacha", icon: "🎁", path: "/gacha" },
    { label: "Ranks", icon: "🏆", path: "/leaderboards" },
  ];

  return (
    <nav style={styles.nav}>
      {navItems.map((item) => (
        <div 
          key={item.label}
          style={styles.navItem}
          onClick={() => navigate(item.path)}
        >
          <span style={styles.icon}>{item.icon}</span>
          <span style={styles.label}>{item.label}</span>
        </div>
      ))}
    </nav>
  );
};

const styles = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '80px',
    background: '#222',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTop: '3px solid #444',
  },
  navItem: {
    textAlign: 'center',
    cursor: 'pointer',
    color: 'white',
    fontSize: '0.8em'
  },
  icon: {
    display: 'block',
    fontSize: '1.8em',
  },
  label: {
    marginTop: '5px',
    fontSize: '0.75em',
  }
};

export default BottomNav;
