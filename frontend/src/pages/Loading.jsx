import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Loading() {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  return (
    <div style={styles.container}>
      <div style={styles.pokeball}>
        <div style={styles.pokeballTop}></div>
      </div>
      <h2 style={styles.text}>Loading your adventure...</h2>
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
    color: 'white',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  pokeball: {
    width: '80px',
    height: '80px',
    border: '4px solid #000',
    borderRadius: '50%',
    position: 'relative',
    background: 'linear-gradient(#f00 0%, #f00 48%, #000 49%, #000 51%, #fff 52%)',
    marginBottom: '30px',
  },
  pokeballTop: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '20px',
    height: '20px',
    background: '#fff',
    border: '4px solid #000',
    borderRadius: '50%',
    zIndex: 1,
  },
  text: {
    margin: 0,
  }
};

export default Loading;