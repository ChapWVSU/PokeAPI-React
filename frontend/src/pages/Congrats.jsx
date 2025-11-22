import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pokemonAPI } from '../services/api';

function Congrats() {
  const [starterPokemon, setStarterPokemon] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    pokemonAPI.getDashboardData()
      .then(data => {
        if (data.starterPokemon) {
          setStarterPokemon(data.starterPokemon);
        }
      })
      .catch(() => navigate('/gacha'));
  }, [navigate]);

  useEffect(() => {
    if (starterPokemon) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [starterPokemon, navigate]);

  if (!starterPokemon) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Congratulations!</h1>
        <h2 style={styles.subtitle}>
          You chose {starterPokemon.name.charAt(0).toUpperCase() + starterPokemon.name.slice(1)}!
        </h2>
        
        <div style={styles.pokemon}>
          <img 
            src={starterPokemon.sprites.front_default} 
            alt={starterPokemon.name}
            style={styles.sprite}
          />
        </div>
        
        <p style={styles.message}>Your adventure begins now! Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  content: {
    background: 'rgba(255,255,255,0.1)',
    padding: '40px',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: '3em',
    marginBottom: '20px',
    color: '#ffcb05',
    textShadow: '2px 2px 0 #2a75bb',
  },
  subtitle: {
    fontSize: '2em',
    marginBottom: '30px',
  },
  sprite: {
    width: '300px',
    height: '300px',
    imageRendering: 'pixelated',
    margin: '20px 0',
  },
  message: {
    fontSize: '1.2em',
    opacity: 0.9,
  },
  loading: {
    fontSize: '2em',
  }
};

export default Congrats;