import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pokemonAPI } from '../services/api';
import capitalize from '../utils/capitalize';

function Gacha() {
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rolling, setRolling] = useState(false);
  const navigate = useNavigate();

  const rollPokemon = async () => {
    setRolling(true);
    setLoading(true);
    
    try {
      const pokemon = await pokemonAPI.getRandomPokemon();
      setCurrentPokemon(pokemon);
    } catch (error) {
      console.error('Failed to fetch Pokemon:', error);
    } finally {
      setLoading(false);
      setTimeout(() => setRolling(false), 500);
    }
  };

  const choosePokemon = async () => {
    if (!currentPokemon) return;
    
    setLoading(true);
    try {
      await pokemonAPI.chooseStarter(currentPokemon);
      navigate('/congrats');
    } catch (error) {
      console.error('Failed to choose Pokemon:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    rollPokemon();
  }, []);

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
      <h1 style={styles.title}>Here's Your Starter Pokemon!</h1>
      <p style={styles.subtitle}>Your bond together is destiny!</p>
      
      <div style={{
        ...styles.pokemonDisplay,
        ...(rolling ? styles.rolling : {})
      }}>
        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : currentPokemon ? (
          <div style={styles.pokemonCard}>
            <img 
              src={currentPokemon.sprites.front_default} 
              alt={capitalize(currentPokemon.name)}
              style={styles.pokemonSprite}
            />
            <h2 style={styles.pokemonName}>
              {capitalize(currentPokemon.name)}
            </h2>
            <div style={styles.types}>
              {currentPokemon.types.map(type => (
                <span key={type} style={getTypeStyle(type)}>
                  {type}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div style={styles.controls}>      
        <button 
          onClick={choosePokemon} 
          disabled={!currentPokemon || loading}
          style={styles.chooseButton}
        >
          {loading ? 'Choosing...' : 'Choose This Pokemon!'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '40px 20px',
    color: 'white',
    textAlign: 'center',
    maxWidth: '600px',
    margin: '0 auto',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  title: {
    marginBottom: '10px',
    fontSize: '2.5em',
  },
  subtitle: {
    marginBottom: '40px',
    fontSize: '1.2em',
    opacity: 0.9,
  },
  pokemonDisplay: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '40px',
    marginBottom: '40px',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255,255,255,0.2)',
    transition: 'all 0.3s ease',
  },
  rolling: {
    opacity: 0.7,
    transform: 'scale(0.95)',
  },
  pokemonCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  pokemonSprite: {
    width: '200px',
    height: '200px',
    imageRendering: 'pixelated',
  },
  pokemonName: {
    fontSize: '2em',
    textTransform: 'capitalize',
  },
  types: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  controls: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  rollButton: {
    padding: '15px 30px',
    fontSize: '1.1em',
    background: '#ffcb05',
    color: '#2a75bb',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    minWidth: '200px',
  },
  chooseButton: {
    padding: '15px 30px',
    fontSize: '1.1em',
    background: '#2a75bb',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    minWidth: '200px',
  },
  loading: {
    fontSize: '1.5em',
    padding: '40px',
  }
};

export default Gacha;