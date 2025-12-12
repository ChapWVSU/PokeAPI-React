import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pokemonAPI } from '../services/api';
import capitalize from '../utils/capitalize';

function Congrats() {
  const [starterPokemon, setStarterPokemon] = useState(null);
  const navigate = useNavigate();

  // 1. Inject Pixel Font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

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

  const pixelFont = "'Press Start 2P', monospace";

  if (!starterPokemon) {
    return (
      <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: pixelFont }}>
        <h2 style={{animation: 'blink 1s infinite'}}>SAVING DATA...</h2>
        <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
      </div>
    );
  }

  return (
    <div style={{...styles.container, fontFamily: pixelFont}}>
      
      {/* Background Pattern */}
      <div style={styles.backgroundPattern}></div>

      <div style={styles.gameContent}>

        {/* Console Frame */}
        <div style={styles.windowFrame}>
            
            <div style={styles.windowHeader}>
                <div style={styles.windowDots}>
                    <span style={styles.dot}></span>
                    <span style={styles.dot}></span>
                </div>
                <span style={styles.headerTitle}>REGISTRATION COMPLETE</span>
            </div>

            <div style={styles.windowBody}>
                
                <div style={styles.confetti}>✨ ✨ ✨</div>

                <h1 style={styles.title}>CONGRATULATIONS!</h1>
                
                <div style={styles.pokemonCard}>
                    <div style={styles.grassContainer}>
                        <img 
                            src={starterPokemon.sprites.front_default} 
                            alt={capitalize(starterPokemon.name)}
                            style={styles.sprite}
                        />
                    </div>
                    <h2 style={styles.subtitle}>
                        YOU CHOSE {capitalize(starterPokemon.name).toUpperCase()}!
                    </h2>
                </div>
                
                <div style={styles.messageBox}>
                    <p style={styles.message}>
                        YOUR ADVENTURE BEGINS NOW!
                        <br/><br/>
                        REDIRECTING...
                    </p>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
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

  // Window Frame
  windowFrame: {
    background: '#f8f8f8',
    border: '4px solid #000',
    width: '100%',
    maxWidth: '600px',
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
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },

  // Content Styles
  confetti: {
    fontSize: '24px',
    marginBottom: '10px',
    animation: 'blink 1s infinite',
  },
  title: {
    fontSize: '20px',
    marginBottom: '30px',
    color: '#d30a40',
    textShadow: '2px 2px 0 #000',
    lineHeight: '1.5',
  },
  pokemonCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '30px',
  },
  grassContainer: {
    width: '200px',
    height: '200px',
    backgroundColor: '#77C959',
    borderRadius: '50%',
    border: '4px solid #000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
    boxShadow: '0 6px 0 rgba(0,0,0,0.2)'
  },
  sprite: {
    width: '180px',
    height: '180px',
    imageRendering: 'pixelated',
  },
  subtitle: {
    fontSize: '14px',
    color: '#000',
    lineHeight: '1.6',
  },
  messageBox: {
    background: '#fff',
    border: '4px double #000',
    padding: '15px 30px',
    width: '100%',
    boxSizing: 'border-box',
  },
  message: {
    fontSize: '10px',
    lineHeight: '1.8',
    margin: 0,
    color: '#555',
  },
};

export default Congrats;