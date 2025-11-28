import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { pokemonAPI } from '../services/api';
<<<<<<< HEAD
import BottomNav from '../components/BottomNav';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
=======
import Navbar from '../components/Navbar';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [userStats, setUserStats] = useState(null);
>>>>>>> zchandro-branch
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
<<<<<<< HEAD
=======
    loadDashboardData();
    loadUserStats();
  }, []);

  const loadDashboardData = () => {
>>>>>>> zchandro-branch
    pokemonAPI.getDashboardData()
      .then(data => {
        setDashboardData(data);
        setLoading(false);
      })
<<<<<<< HEAD
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  const pokemon = dashboardData?.starterPokemon;

  return (
    <div style={styles.container}>
      
      {/* TOP BAR */}
      <div style={styles.topBar}>
        <div style={styles.logo}>LOGO</div>
        <h1 style={styles.appTitle}>Poke K.O.</h1>
        <div style={styles.settings}>⚙️</div>
      </div>

      {/* MAIN AREA */}
      <div style={styles.mainContent}>
        {pokemon ? (
          <div style={styles.pokemonDisplay}>
            <img 
              src={pokemon.sprites.front_default}
              alt={pokemon.name}
              style={styles.pokemonImg}
            />
            <h2 style={styles.pokemonName}>
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} Lv 10
            </h2>
          </div>
        ) : (
          <div style={styles.noStarter}>
            <h2>You haven't chosen a starter</h2>
=======
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

  if (loading) return <div>Loading...</div>;

  const getTypeStyle = (type) => ({
    padding: '5px 15px',
    borderRadius: '20px',
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: '0.8em',
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

  return (
    <div style={styles.container}>
      <Navbar />
      
      <div style={styles.content}>
        <header style={styles.header}>
          <button onClick={logout} style={styles.logoutButton}>Logout</button>
        </header>

        {/* Stats Overview */}
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

        {dashboardData?.starterPokemon ? (
          <div style={styles.starterSection}>
            <h2 style={styles.sectionTitle}>Your Starter Pokemon</h2>
            <div style={styles.pokemonCard}>
              <img 
                src={dashboardData.starterPokemon.sprites.front_default} 
                alt={dashboardData.starterPokemon.name}
                style={styles.pokemonSprite}
              />
              <h3 style={styles.pokemonName}>
                {dashboardData.starterPokemon.name.charAt(0).toUpperCase() + dashboardData.starterPokemon.name.slice(1)}
              </h3>
              <div style={styles.pokemonTypes}>
                {dashboardData.starterPokemon.types.map(type => (
                  <span key={type} style={getTypeStyle(type)}>
                    {type}
                  </span>
                ))}
              </div>
              <div style={styles.pokemonStats}>
                <div style={styles.statRow}>
                  <span>Level:</span>
                  <span>5</span>
                </div>
                <div style={styles.statRow}>
                  <span>Experience:</span>
                  <span>0/100</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={styles.noStarter}>
            <h2>You haven't chosen a starter Pokemon yet!</h2>
>>>>>>> zchandro-branch
            <button 
              onClick={() => window.location.href = '/gacha'}
              style={styles.chooseButton}
            >
<<<<<<< HEAD
              Choose Starter
=======
              Choose Your Starter
>>>>>>> zchandro-branch
            </button>
          </div>
        )}
      </div>
<<<<<<< HEAD

      {/* BOTTOM NAV */}
      <BottomNav />

=======
>>>>>>> zchandro-branch
    </div>
  );
}

<<<<<<< HEAD

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5eec2',
    position: 'relative',
    paddingBottom: '80px',
  },

  /* TOP BAR */
  topBar: {
    width: '100%',
    background: '#fff',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    borderBottom: '2px solid #ccc',
  },
  logo: {
    fontSize: '1.2em',
    fontWeight: 'bold'
  },
  appTitle: {
    fontSize: '1.6em',
    fontWeight: '900',
  },
  settings: {
    fontSize: '1.6em',
    cursor: 'pointer',
  },

  /* CENTER AREA */
  mainContent: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '40px',
  },
  pokemonDisplay: {
    textAlign: 'center',
  },
  pokemonImg: {
    width: '250px',
    imageRendering: 'pixelated',
  },
  pokemonName: {
    marginTop: '15px',
    fontSize: '1.7em',
    fontWeight: 'bold',
  },

  chooseButton: {
    padding: '15px 30px',
    background: '#ffcb05',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    marginTop: '20px',
  },

  noStarter: {
    textAlign: 'center'
  }
};

export default Dashboard;
=======
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  content: {
    padding: '40px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  title: {
    fontSize: '2.5em',
    color: 'white',
  },

  statsOverview: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.1)',
    padding: '20px',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  statIcon: {
    fontSize: '2em',
  },
  statInfo: {
    color: 'white',
  },
  statValue: {
    fontSize: '1.8em',
    fontWeight: 'bold',
  },
  statLabel: {
    opacity: 0.8,
    fontSize: '0.9em',
  },
  quickActions: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '2em',
    color: 'white',
    marginBottom: '20px',
    textAlign: 'center',
  },
  actionGrid: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
  },
  actionCard: {
    background: 'rgba(255,255,255,0.1)',
    padding: '30px',
    borderRadius: '15px',
    textDecoration: 'none',
    color: 'white',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
    transition: 'transform 0.3s ease',
  },
  actionIcon: {
    fontSize: '3em',
    marginBottom: '10px',
  },
  actionText: {
    fontSize: '1.2em',
    fontWeight: 'bold',
  },
  starterSection: {
    textAlign: 'center',
  },
  pokemonCard: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '40px',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255,255,255,0.2)',
    display: 'inline-block',
  },
  pokemonSprite: {
    width: '200px',
    height: '200px',
    imageRendering: 'pixelated',
    marginBottom: '20px',
  },
  pokemonName: {
    fontSize: '1.8em',
    marginBottom: '15px',
    textTransform: 'capitalize',
    color: 'white',
  },
  pokemonTypes: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  pokemonStats: {
    color: 'white',
    background: 'rgba(0,0,0,0.2)',
    padding: '15px',
    borderRadius: '10px',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px',
  },
  noStarter: {
    textAlign: 'center',
    background: 'rgba(255,255,255,0.1)',
    padding: '40px',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    color: 'white',
  },
  chooseButton: {
    background: '#ffcb05',
    color: '#2a75bb',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '10px',
    fontSize: '1.1em',
    cursor: 'pointer',
    maxWidth: '300px',
    marginTop: '20px',
  }
};

export default Dashboard;
>>>>>>> zchandro-branch
