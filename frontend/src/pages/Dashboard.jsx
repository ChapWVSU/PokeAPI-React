import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { pokemonAPI } from '../services/api';
import Navbar from '../components/Navbar';
import capitalize from '../utils/capitalize';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  // 1. Inject Pixel Font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    loadDashboardData();
    loadUserStats();
  }, []);

  const loadDashboardData = () => {
    pokemonAPI.getDashboardData()
      .then(data => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const loadUserStats = async () => {
    try {
      const stats = await pokemonAPI.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const pixelFont = "'Press Start 2P', monospace";

  if (loading) {
    return (
      <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: pixelFont }}>
        <h2 style={{animation: 'blink 1s infinite'}}>LOADING DATA...</h2>
        <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
      </div>
    );
  }

  const typeColors = {
    normal: '#A8A878', fire: '#F08030', water: '#6890F0', grass: '#78C850',
    electric: '#F8D030', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
    ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
    rock: '#B8A038', ghost: '#705898', dark: '#705848', dragon: '#7038F8',
    steel: '#B8B8D0', fairy: '#EE99AC'
  };

  const getTypeStyle = (typeName) => ({
    padding: '4px 8px',
    border: '2px solid rgba(0,0,0,0.2)',
    color: 'white',
    textTransform: 'uppercase',
    fontSize: '0.6em',
    background: typeColors[typeName] || '#A8A878',
    fontFamily: pixelFont,
    textShadow: '1px 1px 0 #000',
    marginRight: '4px',
    display: 'inline-block'
  });

  return (
    <div style={{...styles.container, fontFamily: pixelFont}}>
      
      {/* Background Pattern */}
      <div style={styles.backgroundPattern}></div>

      {/* Navbar Outside Game Box */}
      <div style={{zIndex: 10, width: '100%'}}>
        <Navbar />
      </div>

      <div style={styles.gameContent}>
       

        {/* Console Window Frame */}
        <div style={styles.windowFrame}>
            
            {/* Header Bar */}
            <div style={styles.windowHeader}>
                <div style={styles.windowDots}>
                    <span style={styles.dot}></span>
                    <span style={styles.dot}></span>
                </div>
                <span style={styles.headerTitle}>TRAINER ID: {user?.username?.toUpperCase()}</span>
            </div>

            {/* Inner Content Body */}
            <div style={styles.windowBody}>
                
                <div style={styles.pageHeader}>
                  <div style={styles.welcomeText}>WELCOME BACK, TRAINER!</div>
                </div>

                {/* Stats Overview */}
                {userStats && (
                  <div style={styles.statsRow}>
                    <div style={styles.statBox}>
                      <span style={styles.statLabel}>TROPHIES</span>
                      <span style={styles.statValue}>🏆 {userStats.trophies}</span>
                    </div>
                    <div style={styles.statBox}>
                      <span style={styles.statLabel}>COINS</span>
                      <span style={styles.statValue}>💰 {userStats.coins}</span>
                    </div>
                    <div style={styles.statBox}>
                      <span style={styles.statLabel}>RECORD</span>
                      <span style={styles.statValue}>⚔️ {userStats.wins}/{userStats.totalBattles}</span>
                    </div>
                  </div>
                )}

                {/* Pokemon Section */}
                {dashboardData?.starterPokemon ? (
                  <div style={styles.pokemonSection}>
                    <div style={styles.sectionHeader}> PARTY SLOT 1 </div>
                    
                    <div style={styles.pokemonCard}>
                      <div style={styles.grassContainer}>
                        <img 
                          src={dashboardData.starterPokemon.sprites.front_default} 
                          alt={capitalize(dashboardData.starterPokemon.name)}
                          style={styles.pokemonSprite}
                        />
                      </div>
                      
                      <h3 style={styles.pokemonName}>
                        {capitalize(dashboardData.starterPokemon.name).toUpperCase()}
                      </h3>
                      
                      <div style={{marginBottom: '15px'}}>
                        {dashboardData.starterPokemon.types.map(type => (
                          <span key={type} style={getTypeStyle(type)}>
                            {type}
                          </span>
                        ))}
                      </div>
                      
                      <div style={styles.statList}>
                        <div style={styles.statRow}>
                          <span>LEVEL</span>
                          <span>5</span>
                        </div>
                        <div style={styles.statRow}>
                          <span>EXP</span>
                          <span>0/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={styles.noStarter}>
                    <div style={styles.warningIcon}>!</div>
                    <h2 style={{fontSize: '12px', marginBottom: '20px'}}>NO POKEMON FOUND</h2>
                    <button 
                      onClick={() => window.location.href = '/gacha'}
                      style={styles.chooseButton}
                    >
                      CHOOSE STARTER
                    </button>
                  </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start', 
    position: 'relative',
    overflowY: 'auto',
    backgroundColor: '#202020',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    opacity: 0.1,
    backgroundImage: `
        linear-gradient(45deg, #000 25%, transparent 25%),
        linear-gradient(-45deg, #000 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #000 75%),
        linear-gradient(-45deg, transparent 75%, #000 75%)
    `,
    backgroundSize: '20px 20px',
    zIndex: 0,
  },
  gameContent: {
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    padding: '20px',
    marginTop: '20px',
    marginBottom: '40px',
  },
  mainTitle: {
    color: '#ffde00',
    fontSize: '40px',
    margin: '0 0 20px 0',
    textAlign: 'center',
    textShadow: '4px 4px 0 #3b4cca, -2px -2px 0 #2a3a9a',
    letterSpacing: '4px',
  },
  
  // Window Frame
  windowFrame: {
    background: '#f8f8f8',
    border: '4px solid #000',
    width: '100%',
    // CHANGE 1: Made wider
    maxWidth: '1000px', 
    position: 'relative',
    boxShadow: '10px 10px 0px rgba(0,0,0,0.5)',
  },
  windowHeader: {
    background: '#3b4cca',
    borderBottom: '4px solid #000',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: 'white',
  },
  windowDots: { display: 'flex', gap: '4px' },
  dot: { width: '8px', height: '8px', background: 'white', border: '2px solid #000', display: 'block' },
  headerTitle: { fontSize: '10px', letterSpacing: '1px' },
  
  windowBody: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  
  pageHeader: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    borderBottom: '2px dashed #ccc',
    paddingBottom: '10px'
  },
  welcomeText: { fontSize: '14px', color: '#000' },
  logoutButton: {
    background: 'transparent',
    color: '#d30a40',
    border: '2px solid #d30a40',
    padding: '5px 10px',
    cursor: 'pointer',
    fontSize: '10px',
    fontFamily: "'Press Start 2P', monospace",
    textTransform: 'uppercase'
  },

  statsRow: {
    display: 'flex',
    gap: '15px',
    width: '100%',
    marginBottom: '30px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statBox: {
    border: '3px solid #000',
    background: '#fff',
    padding: '10px',
    flex: '1 1 120px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '4px 4px 0 #ddd',
    textAlign: 'center'
  },
  statLabel: { fontSize: '10px', color: '#555', marginBottom: '8px' },
  statValue: { fontSize: '12px', fontWeight: 'bold' },

  // Pokemon Section
  pokemonSection: {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  sectionHeader: {
    background: '#fff',
    border: '2px solid #000',
    padding: '5px 10px',
    fontSize: '10px',
    marginBottom: '15px',
    zIndex: 2,
  },
  pokemonCard: {
    width: '100%',
    background: '#70cfa3',
    border: '3px solid #000',
    padding: '20px',
    boxShadow: '6px 6px 0 rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  // CHANGE 2: Updated Grass Container to contain the sprite
  grassContainer: {
    width: '150px',
    height: '150px',
    backgroundColor: '#77C959',
    borderRadius: '50%',
    boxShadow: '0 4px 0 0 #4B9032',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '15px',
    border: '2px solid #000',
    padding: '15px',
    overflow: 'hidden' // Ensures sprite doesn't go outside
  },
  // CHANGE 3: Updated Sprite to sit normally inside container
  pokemonSprite: {
    // position absolute removed
    // bottom removed
    width: '100px',
    height: '100px',
    imageRendering: 'pixelated',
    // zIndex removed
    position: 'relative',
  },
  pokemonName: { 
    fontSize: '16px', 
    margin: '10px 0',
    color: '#000',
    textShadow: '2px 2px 0 #fff' 
  },
  statList: {
    width: '100%',
    background: 'rgba(255,255,255,0.6)',
    border: '2px solid #000',
    padding: '10px',
    boxSizing: 'border-box',
    fontSize: '10px',
  },
  statRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginBottom: '5px' 
  },

  // No Starter State
  noStarter: {
    textAlign: 'center',
    background: '#fff',
    padding: '30px',
    border: '3px solid #000',
    boxShadow: '4px 4px 0 #ccc',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '300px'
  },
  warningIcon: {
    fontSize: '24px',
    color: '#d30a40',
    fontWeight: 'bold',
    marginBottom: '10px',
    animation: 'blink 1s infinite'
  },
  chooseButton: {
    background: '#ffcb05',
    border: '2px solid #000',
    padding: '12px 20px',
    fontSize: '10px',
    cursor: 'pointer',
    boxShadow: '4px 4px 0 #000',
    fontFamily: "'Press Start 2P', monospace",
    textTransform: 'uppercase',
    color: '#000'
  }
};

export default Dashboard;