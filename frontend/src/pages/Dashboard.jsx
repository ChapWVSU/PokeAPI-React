import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { pokemonAPI } from '../services/api';
import BottomNav from '../components/BottomNav';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    pokemonAPI.getDashboardData()
      .then(data => {
        setDashboardData(data);
        setLoading(false);
      })
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
            <button 
              onClick={() => window.location.href = '/gacha'}
              style={styles.chooseButton}
            >
              Choose Starter
            </button>
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <BottomNav />

    </div>
  );
}


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
