import React, { useState, useEffect } from 'react';
import { pokemonAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

function Leaderboards() {
  const [leaderboards, setLeaderboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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
      default: return '#3498db';
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

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <Navbar />
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p>Loading leaderboards...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <Navbar />
      
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏆 Leaderboards</h1>
          <p style={styles.subtitle}>Top trainers by trophies</p>
        </div>

        <div style={styles.leaderboardsContainer}>
          {leaderboards.length === 0 ? (
            <div style={styles.emptyState}>
              <h2>No battles yet!</h2>
              <p>Be the first to earn trophies and appear on the leaderboard!</p>
            </div>
          ) : (
            <div style={styles.leaderboardsList}>
              {leaderboards.map((player, index) => (
                <div 
                  key={player.username} 
                  style={{
                    ...styles.leaderboardItem,
                    ...(player.username === user?.username ? styles.currentUser : {})
                  }}
                >
                  <div style={styles.rankSection}>
                    <div 
                      style={{
                        ...styles.rankCircle,
                        background: getRankColor(index + 1)
                      }}
                    >
                      {getRankIcon(index + 1)}
                    </div>
                  </div>
                  
                  <div style={styles.playerInfo}>
                    <div style={styles.playerName}>
                      {player.username}
                      {player.username === user?.username && (
                        <span style={styles.youBadge}> (You)</span>
                      )}
                    </div>
                    <div style={styles.playerStats}>
                      <span style={styles.stat}>Wins: {player.wins || 0}/{player.totalBattles || 0}</span>
                    </div>
                  </div>
                  
                  <div style={styles.trophySection}>
                    <div style={styles.trophyCount}>
                      🏆 {player.trophies}
                    </div>
                    <div style={styles.coinCount}>
                      🪙 {player.coins}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.statsSummary}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{leaderboards.length}</div>
            <div style={styles.statLabel}>Total Players</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {leaderboards[0]?.trophies || 0}
            </div>
            <div style={styles.statLabel}>Top Trophies</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {Math.round(leaderboards.reduce((acc, player) => acc + (player.wins || 0), 0) / leaderboards.length) || 0}
            </div>
            <div style={styles.statLabel}>Avg Wins/Player</div>
          </div>
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
  leaderboardsContainer: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '30px',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255,255,255,0.2)',
    marginBottom: '30px',
  },
  emptyState: {
    textAlign: 'center',
    color: 'white',
    padding: '40px',
  },
  leaderboardsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  leaderboardItem: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '15px',
    padding: '20px',
    transition: 'all 0.3s ease',
    border: '2px solid transparent',
  },
  currentUser: {
    background: 'rgba(52, 152, 219, 0.3)',
    border: '2px solid #3498db',
    transform: 'scale(1.02)',
  },
  rankSection: {
    width: '60px',
    display: 'flex',
    justifyContent: 'center',
  },
  rankCircle: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1.2em',
    color: 'white',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
  playerInfo: {
    flex: 1,
    color: 'white',
  },
  playerName: {
    fontSize: '1.3em',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  youBadge: {
    color: '#3498db',
    fontWeight: 'normal',
  },
  playerStats: {
    fontSize: '0.9em',
    opacity: 0.8,
  },
  stat: {
    marginRight: '15px',
  },
  trophySection: {
    textAlign: 'right',
    color: 'white',
  },
  trophyCount: {
    fontSize: '1.5em',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  coinCount: {
    fontSize: '1em',
    opacity: 0.8,
  },
  statsSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.1)',
    padding: '25px',
    borderRadius: '15px',
    textAlign: 'center',
    color: 'white',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  statNumber: {
    fontSize: '2.5em',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  statLabel: {
    fontSize: '1em',
    opacity: 0.8,
  }
};

export default Leaderboards;