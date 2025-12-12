import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pokemonAPI } from '../services/api';
import capitalize from '../utils/capitalize';

function Gacha() {
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rolling, setRolling] = useState(false);
  const navigate = useNavigate();

  // 1. Inject Pixel Font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

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

  const pixelFont = "'Press Start 2P', monospace";

  const typeColors = {
    normal: '#A8A878', fire: '#F08030', water: '#6890F0', grass: '#78C850',
    electric: '#F8D030', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
    ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
    rock: '#B8A038', ghost: '#705898', dark: '#705848', dragon: '#7038F8',
    steel: '#B8B8D0', fairy: '#EE99AC'
  };

  const getTypeStyle = (type) => ({
    padding: '4px 8px',
    border: '2px solid rgba(0,0,0,0.2)',
    color: 'white',
    textTransform: 'uppercase',
    fontSize: '0.6em',
    background: typeColors[type] || '#A8A878',
    fontFamily: pixelFont,
    textShadow: '1px 1px 0 #000',
    marginRight: '4px',
    display: 'inline-block'
  });

  return (
    <div style={{ ...styles.container, fontFamily: pixelFont }}>
      
      {/* Background Pattern */}
      <div style={styles.backgroundPattern}></div>

      <div style={styles.gameContent}>
        <h1 style={{ ...styles.mainTitle, fontFamily: pixelFont }}>YOUR POKEMON STARTER!</h1>

        {/* Console Frame */}
        <div style={styles.windowFrame}>
            
            {/* Header Bar */}
            <div style={styles.windowHeader}>
                <div style={styles.windowDots}>
                    <span style={styles.dot}></span>
                    <span style={styles.dot}></span>
                </div>
                <span style={styles.headerTitle}>STARTER LAB</span>
            </div>

            {/* Inner Content Body */}
            <div style={styles.windowBody}>
                
                <div style={styles.dialogueBox}>
                    <p style={{lineHeight: '1.6', fontSize: '10px', margin: 0}}>
                        "Ah! This Pokémon seems to have chosen you. Your bond is destiny!"
                    </p>
                </div>

                <div style={styles.displayArea}>
                    {loading ? (
                        <div style={styles.loadingState}>
                            <h2 style={{animation: 'blink 1s infinite', fontSize: '12px'}}>SCANNING BALL...</h2>
                            <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
                        </div>
                    ) : currentPokemon ? (
                        <div style={{
                            ...styles.pokemonCard,
                            ...(rolling ? styles.rollingAnim : {})
                        }}>
                            <div style={styles.grassContainer}>
                                <img 
                                    src={currentPokemon.sprites.front_default} 
                                    alt={capitalize(currentPokemon.name)}
                                    style={styles.pokemonSprite}
                                />
                            </div>
                            
                            <h2 style={styles.pokemonName}>
                                {capitalize(currentPokemon.name).toUpperCase()}
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
                        {loading ? 'SAVING...' : 'I CHOOSE YOU!'}
                    </button>
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
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
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
    maxWidth: '500px',
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
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  // Content
  dialogueBox: {
    background: '#fff',
    border: '4px double #000',
    padding: '15px',
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: '20px',
    boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
  },
  displayArea: {
    width: '100%',
    minHeight: '250px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
  },
  loadingState: {
    padding: '40px',
    textAlign: 'center',
    color: '#555',
  },
  
  // Pokemon Card
  pokemonCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    animation: 'fadeIn 0.5s ease',
  },
  rollingAnim: {
    opacity: 0.5,
    transform: 'scale(0.95)',
    filter: 'blur(2px)',
  },
  grassContainer: {
    width: '180px',
    height: '180px',
    backgroundColor: '#77C959',
    borderRadius: '50%',
    border: '4px solid #000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '15px',
    boxShadow: '0 6px 0 rgba(0,0,0,0.2)',
    overflow: 'hidden'
  },
  pokemonSprite: {
    width: '140px',
    height: '140px',
    imageRendering: 'pixelated',
  },
  pokemonName: {
    fontSize: '18px',
    textTransform: 'capitalize',
    color: '#000',
    margin: '10px 0',
    textShadow: '2px 2px 0 #fff'
  },
  types: {
    display: 'flex',
    gap: '5px',
    justifyContent: 'center',
  },

  // Controls
  controls: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  chooseButton: {
    background: '#ffcb05',
    color: '#000',
    border: '3px solid #000',
    padding: '15px 30px',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: "'Press Start 2P', monospace",
    boxShadow: '4px 4px 0 #000',
    textTransform: 'uppercase',
    transition: 'transform 0.1s',
  }
};

export default Gacha;