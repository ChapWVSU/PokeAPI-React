// ...existing code...
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { pokemonAPI } from '../services/api';
import Navbar from '../components/Navbar';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    loadDashboardData();
    loadUserStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = () => {
    if (!pokemonAPI?.getDashboardData) {
      setLoading(false);
      return;
    }
    pokemonAPI.getDashboardData()
      .then(data => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const loadUserStats = async () => {
    try {
      if (!pokemonAPI?.getUserStats) return;
      const stats = await pokemonAPI.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
        Loading...
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
    padding: '5px 12px',
    borderRadius: '18px',
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: '0.75em',
    background: typeColors[typeName] || '#A8A878'
  });

  const trophies = userStats?.trophies || 0;
  const trophyProgressPercent = Math.min(((trophies % 50) / 50) * 100, 100);

  const starter = dashboardData?.starterPokemon || null;
  const starterTypes = Array.isArray(starter?.types)
    ? starter.types.map(t => (t?.type?.name ?? (typeof t === 'string' ? t : 'unknown')))
    : [];

  return (
    <div style={styles.container}>
      <Navbar />

      <div style={styles.content}>
        <header style={styles.header}>
          <h1 style={styles.title}>Welcome, Trainer {user?.username}!</h1>
          <button onClick={logout} style={styles.logoutButton}>Logout</button>
        </header>

        {userStats && (
          <div style={styles.statsOverview}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>🏆</div>
              <div style={styles.statInfo}>
                <div style={styles.statValue}>{userStats.trophies}</div>
                <div style={styles.statLabel}>Trophies</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>🪙</div>
              <div style={styles.statInfo}>
                <div style={styles.statValue}>{userStats.coins}</div>
                <div style={styles.statLabel}>Coins</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>⚔️</div>
              <div style={styles.statInfo}>
                <div style={styles.statValue}>{userStats.wins}/{userStats.totalBattles}</div>
                <div style={styles.statLabel}>Battles (W/L)</div>
              </div>
            </div>
          </div>
        )}

        <div style={styles.columns}>
          <div style={styles.leftColumn}>
            <div style={styles.encourageBox}>
              <div style={styles.encourageEmoji}>✨</div>
              <h3 style={styles.encourageTitle}>Keep it up, Trainer!</h3>
              <p style={styles.encourageText}>
                Every trophy brings you closer to rare rewards and higher ranks. Head to the Battle Simulator and claim your next badge!
              </p>

              <div style={styles.trophyProgress}>
                <div style={{ ...styles.trophyBar, width: `${trophyProgressPercent}%` }} />
              </div>
              <div style={styles.progressLabel}>
                {trophies} trophies — {Math.round(trophyProgressPercent)}% to next milestone
              </div>
            </div>
          </div>

          <div style={styles.rightColumn}>
            <div style={styles.quickActionsCard}>
              <h2 style={styles.sectionTitle}>Quick Actions</h2>
              <div style={styles.actionGrid}>
                <a href="/battle" style={styles.actionCard}>
                  <div style={styles.actionIcon}>⚔️</div>
                  <div style={styles.actionText}>Battle Simulator</div>
                </a>
              </div>
            </div>

            {starter ? (
              <div style={styles.starterSectionCard}>
                <h2 style={styles.sectionTitle}>Your Starter Pokemon</h2>
                <div style={styles.pokemonCard}>
                  <img
                    src={starter.sprites?.front_default || ''}
                    alt={starter.name || 'starter'}
                    style={styles.pokemonSprite}
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/150x150/cccccc/333333?text=${starter?.name ?? 'Pokémon'}`; }}
                  />
                  <h3 style={styles.pokemonName}>
                    {starter.name ? starter.name.charAt(0).toUpperCase() + starter.name.slice(1) : 'Unknown'}
                  </h3>
                  <div style={styles.pokemonTypes}>
                    {starterTypes.map(t => (
                      <span key={t} style={getTypeStyle(t)}>{t}</span>
                    ))}
                  </div>
                  <div style={styles.pokemonStats}>
                    <div style={styles.statRow}><span>Level:</span><span>5</span></div>
                    <div style={styles.statRow}><span>Experience:</span><span>0/100</span></div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.noStarterCard}>
                <h2>Choose Your Starter</h2>
                <button onClick={() => window.location.href = '/gacha'} style={styles.chooseButton}>Start Your Journey</button>
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
    background: 'linear-gradient(135deg, #56bd56ff 0%, #083c13ff 100%)',
  },
  content: {
    padding: '40px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },

  columns: {
    display: 'flex',
    gap: '40px',
    alignItems: 'flex-start',
    marginBottom: '40px',
    flexWrap: 'wrap'
  },
  leftColumn: {
    flex: '1 1 420px',
    minWidth: 280,
    display: 'flex',
    alignItems: 'center',
  },
  rightColumn: {
    flex: '1 1 640px',
    minWidth: 300,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    alignItems: 'start'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  title: { fontSize: '2.5em', color: 'white' },
  logoutButton: { background: '#ff6b6b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '1em' },

  statsOverview: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' },
  statCard: { background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '15px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' },
  statIcon: { fontSize: '2em' },
  statInfo: { color: 'white' },
  statValue: { fontSize: '1.8em', fontWeight: 'bold' },
  statLabel: { opacity: 0.8, fontSize: '0.9em' },

  encourageBox: { padding: 0, background: 'none', border: 'none', color: 'white', textAlign: 'left' },
  encourageEmoji: { fontSize: '5em', marginBottom: '10px' },
  encourageTitle: { margin: 0, fontSize: '3.0em', marginBottom: '15px', lineHeight: 1.1, textShadow: '0 2px 4px rgba(0,0,0,0.5)' },
  encourageText: { fontSize: '1.2em', margin: 0, marginBottom: '20px', lineHeight: 1.4, opacity: 0.95 },
  trophyProgress: { height: '10px', background: 'rgba(255,255,255,0.12)', borderRadius: '8px', overflow: 'hidden', marginBottom: '6px', maxWidth: '400px' },
  trophyBar: { height: '100%', background: 'linear-gradient(90deg,#FFD700,#FFAA00)', borderRadius: '8px 0 0 8px', transition: 'width 400ms ease' },
  progressLabel: { fontSize: '0.9em', opacity: 0.9 },

  sectionTitle: { fontSize: '1.4em', color: 'white', marginBottom: '20px', textAlign: 'center' },

  quickActionsCard: { background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '20px', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
  actionGrid: { display: 'grid', gridTemplateColumns: '1fr', width: '100%', gap: '20px' },
  actionCard: { background: 'rgba(255,255,255,0.2)', padding: '20px', borderRadius: '15px', textDecoration: 'none', color: 'white', textAlign: 'center', transition: 'transform 0.3s ease' },
  actionIcon: { fontSize: '2.6em', marginBottom: '8px' },
  actionText: { fontSize: '1.05em', fontWeight: 'bold' },

  starterSectionCard: { background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '30px', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.2)', textAlign: 'center' },
  pokemonCard: { display: 'block' },
  pokemonSprite: { width: '150px', height: '150px', imageRendering: 'pixelated', marginBottom: '10px' },
  pokemonName: { fontSize: '1.5em', marginBottom: '10px', textTransform: 'capitalize', color: 'white' },
  pokemonTypes: { display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '12px' },
  pokemonStats: { color: 'white', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '10px' },
  statRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' },

  noStarterCard: { textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '20px', backdropFilter: 'blur(10px)', color: 'white', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
  chooseButton: { background: '#ffcb05', color: '#2a75bb', border: 'none', padding: '12px 22px', borderRadius: '8px', fontSize: '1em', cursor: 'pointer', marginTop: '12px' }
};

export default Dashboard;