import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Loading() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 1. Inject Pixel Font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user?.hasChosenStarter) {
        navigate('/dashboard');
      } else {
        navigate('/gacha');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, user]);

  const pixelFont = "'Press Start 2P', monospace";

  return (
    <div style={{...styles.container, fontFamily: pixelFont}}>
      
      {/* Background Pattern */}
      <div style={styles.backgroundPattern}></div>

      {/* Main Content */}
      <div style={styles.content}>
        
        {/* Animated Pokeball */}
        <div style={styles.pokeballWrapper}>
          <div style={styles.pokeball}>
            <div style={styles.pokeballButton}></div>
          </div>
          {/* Shadow */}
          <div style={styles.shadow}></div>
        </div>

        <div style={styles.textBox}>
            <h2 style={styles.text}>LOADING SAVE...</h2>
            <div style={styles.dots}>
                <span style={{...styles.dot, animationDelay: '0s'}}></span>
                <span style={{...styles.dot, animationDelay: '0.2s'}}></span>
                <span style={{...styles.dot, animationDelay: '0.4s'}}></span>
            </div>
        </div>

      </div>

      {/* Animation Keyframes */}
      <style>
        {`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes blink {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
          }
          @keyframes shake {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(-10deg); }
            50% { transform: rotate(0deg); }
            75% { transform: rotate(10deg); }
            100% { transform: rotate(0deg); }
          }
        `}
      </style>
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
    backgroundColor: '#202020',
    position: 'relative',
    overflow: 'hidden',
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
  content: {
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '30px'
  },
  
  // Pokeball Styles (CSS Art)
  pokeballWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    animation: 'bounce 1s infinite ease-in-out',
  },
  pokeball: {
    width: '100px',
    height: '100px',
    border: '4px solid #000',
    borderRadius: '50%',
    background: 'linear-gradient(to bottom, #d30a40 48%, #000 48%, #000 52%, #fff 52%)',
    position: 'relative',
    boxShadow: 'inset -5px -5px 0 rgba(0,0,0,0.2)',
    animation: 'shake 2s infinite ease-in-out', // Adds a shake like capturing pokemon
  },
  pokeballButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '24px',
    height: '24px',
    background: '#fff',
    border: '4px solid #000',
    borderRadius: '50%',
    zIndex: 2,
    boxShadow: 'inset 0 0 0 2px #ddd',
  },
  shadow: {
    width: '80px',
    height: '10px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '50%',
    marginTop: '10px',
    animation: 'blink 1s infinite', // Simple shadow blink
  },

  // Text Box
  textBox: {
    background: '#fff',
    border: '4px solid #000',
    padding: '15px 25px',
    boxShadow: '6px 6px 0 rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    minWidth: '200px',
  },
  text: {
    margin: 0,
    fontSize: '12px',
    color: '#000',
    letterSpacing: '2px',
    textAlign: 'center',
  },
  dots: {
    display: 'flex',
    gap: '8px',
    height: '8px',
  },
  dot: {
    width: '8px',
    height: '8px',
    background: '#000',
    display: 'block',
    animation: 'blink 1s infinite',
  }
};

export default Loading;