import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pokemonAPI } from '../services/api';
import Navbar from '../components/Navbar';

function PaidGacha() {
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState('');
  const [choosing, setChoosing] = useState(false);
  const navigate = useNavigate();

  // Load initial coins
  const loadUserCoins = async () => {
    try {
      const res = await pokemonAPI.getDashboardData();
      setCoins(res.user.coins);
    } catch (err) {
      console.error('Failed to load coins:', err);
    }
  };

  useEffect(() => {
    loadUserCoins();
  }, []);

  const rollPokemon = async () => {
    if (coins < 150) {
      setError("Not enough coins to roll!");
      return;
    }

    setError('');
    setRolling(true);
    setLoading(true);

    try {
      const result = await pokemonAPI.rollPaidGacha();
      setCurrentPokemon(result.pokemon);
      setCoins(result.newCoins);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to roll Pokémon!');
    }

    setLoading(false);
    setTimeout(() => setRolling(false), 500);
  };

  const choosePokemon = async () => {
    if (!currentPokemon) return;

    setChoosing(true);
    setError('');

    try {
      await pokemonAPI.chooseStarter(currentPokemon);
      navigate('/congrats');
    } catch (err) {
      console.error('Failed to choose Pokemon:', err);
      setError("Failed to choose Pokémon!");
      setChoosing(false);
    }
  };

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

  const getTypeStyle = (type) => ({
    padding: '5px 12px',
    borderRadius: '20px',
    color: 'white',
    textTransform: 'uppercase',
    fontSize: '0.8em',
    background: typeColors[type] || '#A8A878'
  });

  return (
    <div style={styles.pageContainer}>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>Paid Pokémon Gacha</h1>
        <p style={styles.coins}>Your Coins: <strong>{coins}</strong></p>
        <p style={styles.subtitle}>Cost: <strong>150 Coins</strong></p>

        {error && <p style={styles.error}>{error}</p>}

        <div
          style={{
            ...styles.pokemonDisplay,
            ...(rolling ? styles.rolling : {})
          }}
        >
          {loading ? (
            <div style={styles.loading}>Rolling...</div>
          ) : currentPokemon ? (
            <div style={styles.pokemonCard}>
              <img
                src={currentPokemon.sprites.front_default}
                alt={currentPokemon.name}
                style={styles.sprite}
              />
              <h2 style={styles.pokemonName}>
                {currentPokemon.name.charAt(0).toUpperCase() +
                  currentPokemon.name.slice(1)}
              </h2>

              <div style={styles.types}>
                {currentPokemon.types.map((t) => (
                  <span key={t} style={getTypeStyle(t)}>
                    {t}
                  </span>
                ))}
              </div>
              </div>
          ) : (
            <div style={styles.placeholder}>
              Roll to get a new Pokémon!
            </div>
          )}
        </div>

        <div style={styles.controls}>
          <button
            onClick={rollPokemon}
            disabled={loading || rolling || coins < 150}
            style={{
              ...styles.button,
              background: coins < 150 ? '#777' : '#ffcb05',
              color: coins < 150 ? '#ccc' : '#2a75bb'
            }}
          >
            {loading ? 'Rolling...' : 'Roll Again (150 Coins)'}
          </button>

          {currentPokemon && (
            <button
              onClick={choosePokemon}
              disabled={choosing}
              style={styles.chooseButton}
            >
              {choosing ? 'Setting as Starter...' : 'Choose as New Starter'}
            </button>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            style={styles.backButton}
          >
            Back to Dashboard
          </button>
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
    color: 'white',
    textAlign: 'center',
    maxWidth: '600px',
    margin: '0 auto',
  },
  title: { 
    fontSize: '2.4em', 
    marginBottom: '5px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
  },
  coins: { 
    fontSize: '1.3em', 
    marginBottom: '5px',
    background: 'rgba(255,255,255,0.1)',
    padding: '10px 20px',
    borderRadius: '25px',
    display: 'inline-block',
    backdropFilter: 'blur(10px)'
  },
  subtitle: { 
    opacity: 0.9, 
    marginBottom: '25px',
    fontSize: '1.1em'
  },
  error: {
    background: '#ff4d4d',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '15px',
    border: '1px solid #ff0000'
  },
  pokemonDisplay: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '30px',
    marginBottom: '30px',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255,255,255,0.2)',
    transition: 'all 0.3s ease'
  },
  rolling: { 
    opacity: 0.5, 
    transform: 'scale(0.95)' 
  },
  pokemonCard: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center',
    gap: '15px'
  },
  placeholder: {
    fontSize: '1.2em',
    opacity: 0.8,
    padding: '40px'
  },
  sprite: { 
    width: '180px', 
    height: '180px', 
    imageRendering: 'pixelated' 
  },
  pokemonName: { 
    fontSize: '2em', 
    margin: 0,
    textTransform: 'capitalize'
  },
  types: { 
    display: 'flex', 
    gap: '10px', 
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  pokemonInfo: {
    marginTop: '10px',
    padding: '15px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '10px',
    maxWidth: '400px'
  },
  pokemonId: {
    fontSize: '1.1em',
    opacity: 0.8,
    margin: '5px 0'
  },
  choiceInfo: {
    fontSize: '0.9em',
    opacity: 0.9,
    margin: '10px 0 0 0',
    lineHeight: '1.4'
  },
  loading: { 
    fontSize: '1.6em',
    padding: '40px'
  },
  controls: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '15px',
    marginBottom: '30px'
  },
  button: {
    padding: '15px 30px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '1.1em',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  },
  chooseButton: {
    padding: '15px 30px',
    fontSize: '1.1em',
    background: '#2ecc71',
    color: 'white',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  },
  backButton: {
    padding: '15px 30px',
    fontSize: '1.1em',
    background: '#555',
    color: 'white',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  infoSection: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '15px',
    padding: '20px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
    textAlign: 'left'
  },
  infoTitle: {
    fontSize: '1.3em',
    marginBottom: '15px',
    textAlign: 'center'
  },
  infoPoints: {
    lineHeight: '1.6'
  }
};

// Add hover effects
const addHoverEffects = () => {
  const style = document.createElement('style');
  style.textContent = `
    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    }
  `;
  document.head.appendChild(style);
};

addHoverEffects();

export default PaidGacha;