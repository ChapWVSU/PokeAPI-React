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
    // force reflow
    // eslint-disable-next-line no-unused-expressions
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

  return (
    <div style={styles.pageContainer}>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>Paid Pokémon Gacha</h1>
        <p style={styles.coins}>Your Coins: <strong>{coins}</strong></p>
        <p style={styles.subtitle}>Cost: <strong>150 Coins</strong></p>

        {error && <p style={styles.error}>{error}</p>}

        {/* Pokeball animation stage */}
        <div id="backdrop" ref={backdropRef} style={{ display: 'none' }}></div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div className="stage">
            <div className="pokeball hidden" id="ball" ref={ballRef}></div>
            <div id="pokemonBox" ref={boxRef} style={{ display: 'none' }}>
              {currentPokemon && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img
                    src={currentPokemon.sprites.front_default}
                    alt={capitalize(currentPokemon.name)}
                    style={{ width: 400, height: 400, imageRendering: 'pixelated' }}
                  />
                  <div style={{ marginTop: 6, marginBottom: 16, fontWeight: '700', fontSize: '1.2em', color: '#000' }}>{capitalize(currentPokemon.name)}</div>
                  <div style={{ display: 'flex', gap: '12px', flexDirection: 'column', width: '100%' }}>
                    <button
                      onClick={choosePokemon}
                      disabled={choosing}
                      style={{
                        ...styles.boxButton,
                        background: '#2ecc71',
                        color: 'white'
                      }}
                    >
                      {choosing ? 'Setting as Starter...' : 'Choose as New Starter'}
                    </button>
                    <button
                      onClick={handleCancel}
                      style={{
                        ...styles.boxButton,
                        background: '#e74c3c',
                        color: 'white'
                      }}
                    >
                      Cancel
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
              ...styles.button,
              background: coins < 150 || currentPokemon !== null ? '#777' : '#ffcb05',
              color: coins < 150 || currentPokemon !== null ? '#ccc' : '#2a75bb'
            }}
          >
            {loading ? 'Rolling...' : 'Roll (150 Coins)'}
          </button>

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
  boxButton: {
    padding: '12px 20px',
    fontSize: '0.95em',
    borderRadius: '8px',
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
  height: 350px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.pokeball {
  width: 240px;
  height: 240px;
  background:
    radial-gradient(white 20px,
      black 21px 22px,
      white 23px 30px,
      black 31px 40px,
      transparent 41px),
    linear-gradient(to bottom, red 0 100px, black 101px 120px, white 121px 125%);
  border-radius: 50%;
  border: 10px solid black;
  box-shadow: inset -16px -8px 0 0 rgba(0,0,0,0.2);
  position: relative;
  z-index: 1;
  transform-origin: center;
  pointer-events: none;
  transition: background 1s ease-in-out, background-position 1s ease-in-out;
}
.transformed {
  background:
    radial-gradient(white 20px,
      black 21px 22px,
      white 23px 30px,
      black 31px 40px,
      transparent 41px),
    linear-gradient(to bottom, red 0 99px, black 100px 113px, transparent 114px 125%),
    linear-gradient(to bottom, gray 0 111px, black 112px 126px, white 127px 125%);
  background-position:
    center -50px,
    center -50px,
    center 37px;
  background-repeat: no-repeat;
  background-size:
    100% 100%,
    100% 100%,
    100% 100%;
}
.untransformed {
  background:
    radial-gradient(white 20px,
      black 21px 22px,
      white 23px 30px,
      black 31px 40px,
      transparent 41px),
    linear-gradient(to bottom, red 0 99px, black 100px 113px, transparent 114px 125%),
    linear-gradient(to bottom, gray 0 99px, black 100px 113px, white 114px 125%);
  background-position:
    center 0px,
    center 0px,
    center 5px;
  background-repeat: no-repeat;
  background-size:
    100% 100%,
    100% 100%,
    100% 100%;
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
  width: 500px;
  padding: 20px 25px 25px 25px;
  text-align: center;
  background: #fff;
  border: 3px solid #000;
  border-radius: 15px;
  font-size: 24px;
  font-weight: bold;
  z-index: 3;
  box-shadow: 0 12px 32px rgba(0,0,0,0.3);
  color: #333;
}
#backdrop { display:none; position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.25); z-index:2; }

button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}
`;
  const style = document.createElement('style');
  style.id = 'pokeball-styles';
  style.textContent = css;
  document.head.appendChild(style);
})();

export default PaidGacha;