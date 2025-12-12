import React, { useState, useEffect } from 'react';
import { pokemonAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import capitalize from '../utils/capitalize';

function BattleHistory() {
  const [battleHistory, setBattleHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // 1. Inject Pixel Font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    loadBattleHistory();
  }, []);

  const loadBattleHistory = async () => {
    try {
      const data = await pokemonAPI.getBattleHistory();
      setBattleHistory(data);
    } catch (error) {
      console.error('Failed to load battle history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const pixelFont = "'Press Start 2P', monospace";

  const typeColors = {
    normal: '#A8A878', fire: '#F08030', water: '#6890F0', grass: '#78C850',
    electric: '#F8D030', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
    ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
    rock: '#B8A038', ghost: '#705898', dark: '#705848', dragon: '#7038F8',
    steel: '#B8B8D0', fairy: '#EE99AC'
  };

  const getTypeStyle = (type) => ({
    padding: '4px 6px',
    border: '2px solid rgba(0,0,0,0.2)',
    color: 'white',
    textTransform: 'uppercase',
    fontSize: '8px',
    background: typeColors[type] || '#A8A878',
    fontFamily: pixelFont,
    textShadow: '1px 1px 0 #000',
    marginRight: '4px',
    display: 'inline-block'
  });

  if (loading) {
    return (
      <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: pixelFont }}>
        <h2 style={{animation: 'blink 1s infinite'}}>READING CARTRIDGE...</h2>
        <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ ...styles.container, fontFamily: pixelFont }}>
      
      {/* Background Pattern */}
      <div style={styles.backgroundPattern}></div>

      {/* Navbar Outside */}
      <div style={{zIndex: 10, width: '100%'}}>
        <Navbar />
      </div>

      <div style={styles.gameContent}>
        <h1 style={{ ...styles.mainTitle, fontFamily: pixelFont }}>BATTLE HISTORY</h1>

        {/* Console Frame */}
        <div style={styles.windowFrame}>
            
            {/* Header Bar */}
            <div style={styles.windowHeader}>
                <div style={styles.windowDots}>
                    <span style={styles.dot}></span>
                    <span style={styles.dot}></span>
                </div>
                <span style={styles.headerTitle}>BATTLE LOG</span>
            </div>

            {/* Inner Content Body */}
            <div style={styles.windowBody}>
                
                <div style={styles.pageHeader}>
                  <div style={styles.headerText}>:: RECENT BATTLES ::</div>
                </div>

                {/* STATS OVERVIEW */}
                <div style={styles.statsRow}>
                  <div style={styles.statBox}>
                    <div style={styles.statNumber}>{battleHistory.length}</div>
                    <div style={styles.statLabel}>TOTAL</div>
                  </div>
                  <div style={styles.statBox}>
                    <div style={{...styles.statNumber, color: '#4dad5b'}}>
                      {battleHistory.filter(battle => battle.result === 'win').length}
                    </div>
                    <div style={styles.statLabel}>WINS</div>
                  </div>
                  <div style={styles.statBox}>
                    <div style={{...styles.statNumber, color: '#d30a40'}}>
                      {battleHistory.filter(battle => battle.result === 'lost').length}
                    </div>
                    <div style={styles.statLabel}>LOSSES</div>
                  </div>
                  <div style={styles.statBox}>
                    <div style={{...styles.statNumber, color: '#ffcb05'}}>
                      {battleHistory.reduce((total, battle) => total + battle.trophiesEarned, 0)}
                    </div>
                    <div style={styles.statLabel}>TROPHIES</div>
                  </div>
                </div>

                {/* BATTLE LIST */}
                <div style={styles.listContainer}>
                  {battleHistory.length === 0 ? (
                    <div style={styles.emptyState}>
                      <p>NO BATTLE DATA FOUND.</p>
                      <a href="/battle" style={styles.actionButton}>START BATTLE</a>
                    </div>
                  ) : (
                    <div style={styles.battleList}>
                      {battleHistory.map((battle) => (
                        <div key={battle.id} style={styles.battleItem}>
                          
                          {/* Row 1: Result & Date */}
                          <div style={styles.itemHeader}>
                             <span style={
                                battle.result === 'win' ? styles.winBadge : styles.lossBadge
                             }>
                                {battle.result === 'win' ? 'VICTORY' : 'DEFEAT'}
                             </span>
                             <span style={styles.dateText}>{formatDate(battle.date)}</span>
                          </div>

                          {/* Row 2: Details */}
                          <div style={styles.itemBody}>
                             <div style={styles.opponentSection}>
                                <div style={styles.spriteFrame}>
                                    <img 
                                        src={battle.opponent.sprites.front_default} 
                                        alt={capitalize(battle.opponent.name)}
                                        style={styles.opponentSprite}
                                    />
                                </div>
                                <div style={styles.opponentInfo}>
                                    <div style={styles.vsText}>VS</div>
                                    <div style={styles.opponentName}>{capitalize(battle.opponent.name).toUpperCase()}</div>
                                    <div style={styles.opponentLevel}>LVL {battle.opponent.level}</div>
                                    <div style={styles.typesRow}>
                                        {battle.opponent.types.map(type => (
                                            <span key={type} style={getTypeStyle(type)}>{type}</span>
                                        ))}
                                    </div>
                                </div>
                             </div>

                             <div style={styles.rewardsSection}>
                                {battle.trophiesEarned > 0 && (
                                    <div style={styles.rewardItem}>🏆 +{battle.trophiesEarned}</div>
                                )}
                                <div style={styles.rewardItem}>💰 +{battle.coinsEarned}</div>
                             </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  // 1. Container
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

  // 2. Window Frame
  windowFrame: {
    background: '#f8f8f8',
    border: '4px solid #000',
    width: '100%',
    maxWidth: '800px',
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
    marginBottom: '20px',
    borderBottom: '2px dashed #ccc',
    paddingBottom: '10px',
    width: '100%',
    textAlign: 'center'
  },
  headerText: {
    margin: 0,
    fontSize: '14px',
    textAlign: 'center',
    color: '#000',
  },

  // 3. Stats Overview (Grid of boxes)
  statsRow: {
    display: 'flex',
    gap: '10px',
    width: '100%',
    marginBottom: '25px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  statBox: {
    border: '3px solid #000',
    background: '#fff',
    padding: '10px',
    flex: '1 1 80px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '4px 4px 0 #ddd',
    textAlign: 'center'
  },
  statNumber: { fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' },
  statLabel: { fontSize: '8px', color: '#555' },

  // 4. Battle List
  listContainer: {
    width: '100%',
    maxHeight: '500px',
    overflowY: 'auto',
    border: '2px solid #000',
    background: '#eee', // Inner recessed area
    padding: '10px',
    boxSizing: 'border-box'
  },
  emptyState: { textAlign: 'center', padding: '40px', fontSize: '12px' },
  actionButton: {
    background: '#ffcb05',
    color: '#000',
    border: '3px solid #000',
    padding: '10px 20px',
    textDecoration: 'none',
    fontSize: '10px',
    boxShadow: '3px 3px 0 #000',
    display: 'inline-block',
    fontWeight: 'bold',
    marginTop: '15px'
  },

  battleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  battleItem: {
    background: '#fff',
    border: '2px solid #000',
    padding: '10px',
    boxShadow: '3px 3px 0 rgba(0,0,0,0.1)',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #ccc',
    paddingBottom: '8px',
    marginBottom: '8px'
  },
  winBadge: {
    background: '#4dad5b',
    color: '#fff',
    padding: '4px 8px',
    fontSize: '10px',
    border: '2px solid #000',
    textShadow: '1px 1px 0 #000'
  },
  lossBadge: {
    background: '#d30a40',
    color: '#fff',
    padding: '4px 8px',
    fontSize: '10px',
    border: '2px solid #000',
    textShadow: '1px 1px 0 #000'
  },
  dateText: { fontSize: '8px', color: '#666' },

  itemBody: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  opponentSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1
  },
  spriteFrame: {
    width: '50px',
    height: '50px',
    border: '2px solid #000',
    background: '#f0f0f0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '4px'
  },
  opponentSprite: { width: '40px', height: '40px', imageRendering: 'pixelated' },
  opponentInfo: { display: 'flex', flexDirection: 'column' },
  vsText: { fontSize: '8px', color: '#888', fontStyle: 'italic' },
  opponentName: { fontSize: '12px', fontWeight: 'bold' },
  opponentLevel: { fontSize: '8px', color: '#444' },
  typesRow: { marginTop: '4px' },

  rewardsSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '5px'
  },
  rewardItem: {
    fontSize: '10px',
    background: '#eee',
    padding: '2px 5px',
    border: '1px solid #ccc'
  }
};

export default BattleHistory;