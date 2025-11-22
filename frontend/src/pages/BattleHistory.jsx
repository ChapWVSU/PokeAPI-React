import React, { useState, useEffect } from 'react';
import { pokemonAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

function BattleHistory() {
  const [battleHistory, setBattleHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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

  const getTypeStyle = (type) => ({
    padding: '3px 8px',
    borderRadius: '12px',
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: '0.7em',
    background: typeColors[type] || '#A8A878'
  });

  const typeColors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    grass: '#78C850',
    electric: '#F8D030',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dark: '#705848',
    dragon: '#7038F8',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
  };

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <Navbar />
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p>Loading battle history...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <Navbar />
      
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>⚔️ Battle History</h1>
          <p style={styles.subtitle}>Your recent battles and outcomes</p>
        </div>

        <div style={styles.statsOverview}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{battleHistory.length}</div>
            <div style={styles.statLabel}>Total Battles</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {battleHistory.filter(battle => battle.result === 'win').length}
            </div>
            <div style={styles.statLabel}>Wins</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {battleHistory.filter(battle => battle.result === 'lost').length}
            </div>
            <div style={styles.statLabel}>Losses</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {battleHistory.reduce((total, battle) => total + battle.trophiesEarned, 0)}
            </div>
            <div style={styles.statLabel}>Total Trophies</div>
          </div>
        </div>

        <div style={styles.battleHistoryContainer}>
          {battleHistory.length === 0 ? (
            <div style={styles.emptyState}>
              <h2>No battles yet!</h2>
              <p>Go to the Battle Simulator to start your first battle!</p>
              <a href="/battle" style={styles.battleLink}>Start Battling</a>
            </div>
          ) : (
            <div style={styles.battleList}>
              {battleHistory.map((battle) => (
                <div key={battle.id} style={styles.battleItem}>
                  <div style={styles.battleHeader}>
                    <div style={styles.resultSection}>
                      <div 
                        style={{
                          ...styles.resultBadge,
                          ...(battle.result === 'win' ? styles.winBadge : styles.lossBadge)
                        }}
                      >
                        {battle.result === 'win' ? 'VICTORY' : 'DEFEAT'}
                      </div>
                      <div style={styles.date}>
                        {formatDate(battle.date)}
                      </div>
                    </div>
                    
                    <div style={styles.rewardsSection}>
                      {battle.trophiesEarned > 0 && (
                        <div style={styles.reward}>
                          🏆 +{battle.trophiesEarned}
                        </div>
                      )}
                      <div style={styles.reward}>
                        🪙 +{battle.coinsEarned}
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.battleDetails}>
                    <div style={styles.opponentInfo}>
                      <img 
                        src={battle.opponent.sprites.front_default} 
                        alt={battle.opponent.name}
                        style={styles.opponentSprite}
                      />
                      <div style={styles.opponentDetails}>
                        <div style={styles.opponentName}>
                          {battle.opponent.name}
                        </div>
                        <div style={styles.opponentLevel}>
                          Lv. {battle.opponent.level}
                        </div>
                        <div style={styles.types}>
                          {battle.opponent.types.map(type => (
                            <span key={type} style={getTypeStyle(type)}>
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  container: {
    padding: '20px',
    paddingTop: '80px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    color: 'white',
    textAlign: 'center',
  },
  loadingSpinner: {
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    color: 'white',
  },
  title: {
    fontSize: '3em',
    marginBottom: '10px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
  },
  subtitle: {
    fontSize: '1.2em',
    opacity: 0.9,
  },
  statsOverview: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.1)',
    padding: '20px',
    borderRadius: '15px',
    textAlign: 'center',
    color: 'white',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  statNumber: {
    fontSize: '2em',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  statLabel: {
    fontSize: '0.9em',
    opacity: 0.8,
  },
  battleHistoryContainer: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '30px',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255,255,255,0.2)',
  },
  emptyState: {
    textAlign: 'center',
    color: 'white',
    padding: '40px',
  },
  battleLink: {
    display: 'inline-block',
    background: '#e74c3c',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    marginTop: '15px',
    fontWeight: 'bold',
  },
  battleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  battleItem: {
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '15px',
    padding: '20px',
    border: '2px solid rgba(255,255,255,0.1)',
  },
  battleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
  },
  resultSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  resultBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '0.9em',
    textTransform: 'uppercase',
  },
  winBadge: {
    background: '#2ecc71',
    color: 'white',
  },
  lossBadge: {
    background: '#e74c3c',
    color: 'white',
  },
  date: {
    fontSize: '0.8em',
    color: 'rgba(255,255,255,0.7)',
  },
  rewardsSection: {
    display: 'flex',
    gap: '10px',
  },
  reward: {
    background: 'rgba(255,255,255,0.2)',
    padding: '5px 10px',
    borderRadius: '10px',
    color: 'white',
    fontSize: '0.9em',
  },
  battleDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  opponentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  opponentSprite: {
    width: '80px',
    height: '80px',
    imageRendering: 'pixelated',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '5px',
  },
  opponentDetails: {
    color: 'white',
  },
  opponentName: {
    fontSize: '1.2em',
    fontWeight: 'bold',
    textTransform: 'capitalize',
    marginBottom: '5px',
  },
  opponentLevel: {
    fontSize: '0.9em',
    opacity: 0.8,
    marginBottom: '8px',
  },
  types: {
    display: 'flex',
    gap: '5px',
  },
};

export default BattleHistory;