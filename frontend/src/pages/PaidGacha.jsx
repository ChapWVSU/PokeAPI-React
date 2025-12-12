import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { pokemonAPI } from '../services/api';
import Navbar from '../components/Navbar';
import capitalize from '../utils/capitalize';

function PaidGacha() {
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState('');
  const [choosing, setChoosing] = useState(false);
  const navigate = useNavigate();
  const ballRef = useRef(null);
  const boxRef = useRef(null);
  const backdropRef = useRef(null);
  const hasInitialFall = useRef(false);

  // 1. Inject Pixel Font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

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
      
      // Trigger catch animation after pokemon is set
      setTimeout(() => {
        startCatchAnimation();
      }, 100);
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

  // Animation helpers (pokeball)
  useEffect(() => {
    const ball = ballRef.current;
    if (!ball) return;

    const onAnimEnd = (e) => {
      if (e.animationName === 'fall') {
        hasInitialFall.current = true;
      }
      if (e.animationName === 'blink') {
        // transform after blink
        ball.classList.add('transformed');
        // show box and backdrop after transition
        setTimeout(() => {
          if (boxRef.current) boxRef.current.style.display = 'block';
          if (backdropRef.current) backdropRef.current.style.display = 'block';
        }, 1000);
      }
    };

    ball.addEventListener('animationend', onAnimEnd);
    return () => ball.removeEventListener('animationend', onAnimEnd);
  }, []);

  useEffect(() => {
    // initial fall on first mount only
    const ball = ballRef.current;
    if (!ball) return;
    if (!hasInitialFall.current) {
      setTimeout(() => {
        ball.classList.remove('hidden');
        ball.classList.add('fall');
      }, 800);
    }
  }, []);

  const triggerShake = () => {
    const ball = ballRef.current;
    if (!ball) return;
    ball.classList.remove('shake');
    void ball.offsetWidth;
    ball.classList.add('shake');
  };

  const startCatchAnimation = () => {
    const ball = ballRef.current;
    let shakes = 0;

    function doShake() {
      triggerShake();
      setTimeout(() => {
        shakes++;
        if (shakes < 3) {
          doShake();
        } else {
          ball.classList.add('blink');
        }
      }, 800);
    }

    doShake();
  };

  const resetFromBackdrop = () => {
    if (boxRef.current) boxRef.current.style.display = 'none';
    if (backdropRef.current) backdropRef.current.style.display = 'none';
    const ball = ballRef.current;
    if (!ball) return;
    ball.classList.remove('transformed');
    ball.classList.add('untransformed');
    setTimeout(() => {
      ball.classList.remove('untransformed');
      ball.classList.remove('blink', 'shake', 'fall');
      setChoosing(false);
    }, 1000);
  };

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
    textShadow: '1px 1px 0 #000',
    marginRight: '4px',
    display: 'inline-block'
  });

  const handleCancel = () => {
    // Reset animation state and hide box
    if (boxRef.current) boxRef.current.style.display = 'none';
    if (backdropRef.current) backdropRef.current.style.display = 'none';
    const ball = ballRef.current;
    if (!ball) return;
    ball.classList.remove('transformed');
    ball.classList.add('untransformed');
    setTimeout(() => {
      ball.classList.remove('untransformed');
      ball.classList.remove('blink', 'shake', 'fall');
      setCurrentPokemon(null);
      setChoosing(false);
      hasInitialFall.current = false;
    }, 1000);
  };

  const pixelFont = "'Press Start 2P', monospace";

  return (
    <div style={{ ...styles.container, fontFamily: pixelFont }}>
      
      {/* Background Pattern */}
      <div style={styles.backgroundPattern}></div>

      {/* Navbar Outside */}
      <div style={{zIndex: 10, width: '100%'}}>
        <Navbar />
      </div>

      <div style={styles.gameContent}>
        <h1 style={{ ...styles.mainTitle, fontFamily: pixelFont }}>PAID POKEMON GACHA</h1>

        {/* Console Frame */}
        <div style={styles.windowFrame}>
            
            {/* Header Bar */}
            <div style={styles.windowHeader}>
                <div style={styles.windowDots}>
                    <span style={styles.dot}></span>
                    <span style={styles.dot}></span>
                </div>
                <span style={styles.headerTitle}>GACHA MACHINE</span>
            </div>

            {/* Inner Content Body */}
            <div style={styles.windowBody}>
                
                <div style={styles.pageHeader}>
                  <div style={styles.headerText}> RARE POKEMON </div>
                </div>

                <div style={styles.infoBox}>
                    <p style={{marginBottom: '10px'}}>YOUR COINS: <span style={{color: '#ffcb05'}}>{coins}</span></p>
                    <p>COST: <span style={{color: '#d30a40'}}>150 COINS</span></p>
                </div>

                {error && <div style={styles.error}>{error}</div>}

                {/* Pokeball animation stage */}
                <div id="backdrop" ref={backdropRef} style={{ display: 'none' }}></div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, position: 'relative' }}>
                  <div className="stage">
                    <div className="pokeball hidden" id="ball" ref={ballRef}></div>
                    
                    {/* POPUP BOX - Styled Retro */}
                    <div id="pokemonBox" ref={boxRef} style={{ display: 'none' }}>
                      {currentPokemon && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={styles.resultHeader}> NEW ENCOUNTER </div>
                          
                          <div style={styles.grassContainer}>
                              <img
                                src={currentPokemon.sprites.front_default}
                                alt={capitalize(currentPokemon.name)}
                                style={{ width: 150, height: 150, imageRendering: 'pixelated' }}
                              />
                          </div>
                          
                          <div style={{ margin: '10px 0', fontSize: '14px', color: '#000' }}>
                            {capitalize(currentPokemon.name).toUpperCase()}
                          </div>
                          
                          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', width: '100%' }}>
                            <button
                              onClick={choosePokemon}
                              disabled={choosing}
                              style={styles.actionButton}
                            >
                              {choosing ? 'SAVING...' : 'KEEP POKEMON'}
                            </button>
                            <button
                              onClick={handleCancel}
                              style={styles.cancelButton}
                            >
                              RELEASE
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={styles.controls}>
                  <button
                    onClick={rollPokemon}
                    disabled={loading || rolling || coins < 150 || currentPokemon !== null}
                    style={{
                      ...styles.mainButton,
                      background: coins < 150 || currentPokemon !== null ? '#ccc' : '#ffcb05',
                      color: coins < 150 || currentPokemon !== null ? '#777' : '#000',
                      cursor: coins < 150 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'ROLLING...' : 'INSERT COIN (150)'}
                  </button>

                  <button
                    onClick={() => navigate('/dashboard')}
                    style={styles.backButton}
                  >
                    BACK TO MENU
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
    justifyContent: 'flex-start',
    position: 'relative',
    overflowY: 'auto',
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
    marginTop: '20px',
    marginBottom: '40px',
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
    maxWidth: '800px',
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
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  
  pageHeader: {
    marginBottom: '20px',
    borderBottom: '2px dashed #ccc',
    paddingBottom: '10px',
    width: '100%',
    textAlign: 'center'
  },
  headerText: {
    margin: 0,
    fontSize: '14px',
    textAlign: 'center',
    color: '#000',
  },

  // Info Box
  infoBox: {
    background: '#fff',
    border: '2px solid #000',
    padding: '15px',
    marginBottom: '20px',
    textAlign: 'center',
    fontSize: '12px',
    boxShadow: '4px 4px 0 #ddd'
  },
  error: {
    background: '#ffcdcd',
    color: '#8a0000',
    border: '2px solid #8a0000',
    padding: '10px',
    marginBottom: '15px',
    textAlign: 'center',
    fontSize: '10px'
  },

  // Result Box Specifics
  resultHeader: {
    background: '#3b4cca',
    color: '#fff',
    padding: '5px 10px',
    fontSize: '10px',
    marginBottom: '15px',
    width: '100%',
    textAlign: 'center'
  },
  grassContainer: {
    width: '180px',
    height: '180px',
    backgroundColor: '#77C959',
    borderRadius: '50%',
    border: '3px solid #000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '10px'
  },

  // Buttons
  controls: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '15px',
    marginTop: '20px',
    width: '100%',
    maxWidth: '300px'
  },
  mainButton: {
    padding: '15px',
    border: '3px solid #000',
    fontSize: '12px',
    fontFamily: "'Press Start 2P', monospace",
    boxShadow: '4px 4px 0 #000',
    textAlign: 'center'
  },
  backButton: {
    padding: '15px',
    background: '#fff',
    color: '#000',
    border: '3px solid #000',
    fontSize: '10px',
    fontFamily: "'Press Start 2P', monospace",
    cursor: 'pointer',
    boxShadow: '4px 4px 0 #ccc',
    textAlign: 'center'
  },
  actionButton: {
    padding: '12px',
    background: '#4dad5b',
    color: '#fff',
    border: '2px solid #000',
    fontSize: '10px',
    fontFamily: "'Press Start 2P', monospace",
    cursor: 'pointer',
    boxShadow: '2px 2px 0 #000'
  },
  cancelButton: {
    padding: '12px',
    background: '#d30a40',
    color: '#fff',
    border: '2px solid #000',
    fontSize: '10px',
    fontFamily: "'Press Start 2P', monospace",
    cursor: 'pointer',
    boxShadow: '2px 2px 0 #000'
  }
};

// Inject pokeball + hover styles once
(function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('pokeball-styles')) return;

  const css = `
.hidden { opacity: 0; }
.stage {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.pokeball {
  width: 150px;
  height: 150px;
  background:
    radial-gradient(white 15px,
      black 16px 17px,
      white 18px 22px,
      black 23px 28px,
      transparent 29px),
    linear-gradient(to bottom, #d30a40 0 70px, black 71px 80px, white 81px 100%);
  border-radius: 50%;
  border: 4px solid black;
  box-shadow: 4px 4px 0 rgba(0,0,0,0.2);
  position: relative;
  z-index: 1;
  transform-origin: center;
  pointer-events: none;
  transition: background 1s ease-in-out, background-position 1s ease-in-out;
}
.transformed {
  background:
    radial-gradient(white 15px,
      black 16px 17px,
      white 18px 22px,
      black 23px 28px,
      transparent 29px),
    linear-gradient(to bottom, #d30a40 0 69px, black 70px 79px, transparent 80px 100%),
    linear-gradient(to bottom, #888 0 79px, black 80px 89px, white 90px 100%);
  background-position:
    center -30px,
    center -30px,
    center 25px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
.untransformed {
  background:
    radial-gradient(white 15px,
      black 16px 17px,
      white 18px 22px,
      black 23px 28px,
      transparent 29px),
    linear-gradient(to bottom, #d30a40 0 69px, black 70px 79px, transparent 80px 100%),
    linear-gradient(to bottom, #888 0 69px, black 70px 79px, white 80px 100%);
  background-position: center 0px, center 0px, center 3px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
@keyframes fall {
  0% { transform: translateY(-200%); opacity: 1; }
  60% { transform: translateY(0); }
  80% { transform: translateY(-10%); }
  100% { transform: translateY(0); }
}
@keyframes shake {
  0% { transform: translateX(0) rotate(0); }
  20% { transform: translateX(-10px) rotate(-20deg); }
  30% { transform: translateX(10px) rotate(20deg); }
  50% { transform: translateX(-10px) rotate(-10deg); }
  60% { transform: translateX(10px) rotate(10deg); }
  100% { transform: translateX(0) rotate(0); }
}
@keyframes blink { 75% { filter: brightness(50%); } }
.fall { animation: fall 0.5s ease-in-out forwards; }
.shake { animation: shake 0.5s ease-in-out; }
.blink { animation: blink 0.25s ease-in-out 3; }

#pokemonBox {
  display: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 280px;
  padding: 15px;
  text-align: center;
  background: #f8f8f8;
  border: 4px solid #000;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  z-index: 3;
  box-shadow: 10px 10px 0 rgba(0,0,0,0.5);
  color: #333;
}
#backdrop { display:none; position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.7); z-index:2; }
`;
  const style = document.createElement('style');
  style.id = 'pokeball-styles';
  style.textContent = css;
  document.head.appendChild(style);
})();

export default PaidGacha;