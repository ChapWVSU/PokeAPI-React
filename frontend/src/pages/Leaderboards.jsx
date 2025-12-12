import React, { useState, useEffect } from 'react';
import { pokemonAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

function Leaderboards() {
  const [leaderboards, setLeaderboards] = useState([]);
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
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    try {
      const data = await pokemonAPI.getLeaderboards();
      setLeaderboards(data);
    } catch (error) {
      console.error('Failed to load leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#fff';   // Standard White
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const pixelFont = "'Press Start 2P', monospace";

  if (loading) {
    return (
      <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: pixelFont }}>
        <h2 style={{animation: 'blink 1s infinite'}}>FETCHING DATA...</h2>
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
        <h1 style={{ ...styles.mainTitle, fontFamily: pixelFont }}>LEADERBOARDS</h1>

        {/* Console Frame */}
        <div style={styles.windowFrame}>
            
            {/* Header Bar */}
            <div style={styles.windowHeader}>
                <div style={styles.windowDots}>
                    <span style={styles.dot}></span>
                    <span style={styles.dot}></span>
                </div>
                <span style={styles.headerTitle}>HALL OF FAME</span>
            </div>

            {/* Inner Content Body */}
            <div style={styles.windowBody}>
                
                <div style={styles.pageHeader}>
                  <div style={styles.headerText}>:: TOP TRAINERS ::</div>
                </div>

                {/* Stats Summary Row */}
                <div style={styles.summaryRow}>
                    <div style={styles.summaryBox}>
                        <div style={styles.summaryLabel}>PLAYERS</div>
                        <div style={styles.summaryValue}>{leaderboards.length}</div>
                    </div>
                    <div style={styles.summaryBox}>
                        <div style={styles.summaryLabel}>TOP SCORE</div>
                        <div style={{...styles.summaryValue, color: '#FFD700'}}>
                            {leaderboards[0]?.trophies || 0}
                        </div>
                    </div>
                    <div style={styles.summaryBox}>
                        <div style={styles.summaryLabel}>AVG WINS</div>
                        <div style={styles.summaryValue}>
                             {Math.round(leaderboards.reduce((acc, player) => acc + (player.wins || 0), 0) / leaderboards.length) || 0}
                        </div>
                    </div>
                </div>

                {/* LEADERBOARD LIST */}
                <div style={styles.listContainer}>
                  {leaderboards.length === 0 ? (
                    <div style={styles.emptyState}>
                      <p>NO DATA AVAILABLE.</p>
                      <p style={{marginTop: '10px', fontSize: '8px', color: '#666'}}>BE THE FIRST CHAMPION!</p>
                    </div>
                  ) : (
                    <div style={styles.leaderboardsList}>
                      {leaderboards.map((player, index) => {
                        const isCurrentUser = player.username === user?.username;
                        const rankColor = getRankColor(index + 1);
                        
                        return (
                            <div 
                              key={player.username} 
                              style={{
                                ...styles.leaderboardItem,
                                ...(isCurrentUser ? styles.currentUserItem : {})
                              }}
                            >
                              {/* Rank Section */}
                              <div style={{
                                  ...styles.rankBadge,
                                  backgroundColor: index < 3 ? rankColor : '#eee'
                              }}>
                                {getRankIcon(index + 1)}
                              </div>
                              
                              {/* Player Info */}
                              <div style={styles.playerInfo}>
                                <div style={styles.nameRow}>
                                    <span style={styles.playerName}>{player.username.toUpperCase()}</span>
                                    {isCurrentUser && <span style={styles.youTag}>◀ YOU</span>}
                                </div>
                                <div style={styles.subStats}>
                                   WINS: {player.wins}/{player.totalBattles || 0}
                                </div>
                              </div>
                              
                              {/* Trophies Section */}
                              <div style={styles.trophySection}>
                                <div style={styles.trophyCount}>🏆 {player.trophies}</div>
                                <div style={styles.coinCount}>🪙 {player.coins}</div>
                              </div>
                            </div>
                        );
                      })}
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

  // 3. Stats Summary (Top Boxes)
  summaryRow: {
    display: 'flex',
    gap: '15px',
    width: '100%',
    marginBottom: '20px',
    justifyContent: 'center',
  },
  summaryBox: {
    border: '3px solid #000',
    background: '#fff',
    padding: '10px',
    flex: 1,
    textAlign: 'center',
    boxShadow: '4px 4px 0 #ddd'
  },
  summaryLabel: { fontSize: '8px', color: '#666', marginBottom: '5px' },
  summaryValue: { fontSize: '12px', fontWeight: 'bold' },

  // 4. List Container
  listContainer: {
    width: '100%',
    maxHeight: '500px',
    overflowY: 'auto',
    border: '2px solid #000',
    background: '#eee', // Recessed look
    padding: '10px',
    boxSizing: 'border-box'
  },
  emptyState: { textAlign: 'center', padding: '40px', fontSize: '10px' },
  
  leaderboardsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  
  // 5. Leaderboard Item
  leaderboardItem: {
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
    border: '2px solid #000',
    padding: '10px',
    boxShadow: '2px 2px 0 rgba(0,0,0,0.1)',
    transition: 'transform 0.1s',
  },
  currentUserItem: {
    background: '#fffbe6', // Light yellow highlight
    border: '2px solid #ffcb05',
    transform: 'translateX(-4px)',
    boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
  },
  
  rankBadge: {
    width: '35px',
    height: '35px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #000',
    marginRight: '15px',
    fontSize: '12px',
    fontWeight: 'bold',
    boxShadow: '2px 2px 0 rgba(0,0,0,0.1)'
  },
  
  playerInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  nameRow: { display: 'flex', alignItems: 'center' },
  playerName: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#000',
    marginRight: '10px'
  },
  youTag: {
    fontSize: '8px',
    color: '#d30a40',
    animation: 'blink 1s infinite'
  },
  subStats: {
    fontSize: '8px',
    color: '#666',
    marginTop: '4px'
  },
  
  trophySection: {
    textAlign: 'right',
  },
  trophyCount: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#000',
    marginBottom: '4px'
  },
  coinCount: {
    fontSize: '8px',
    color: '#555'
  }
};

export default Leaderboards;