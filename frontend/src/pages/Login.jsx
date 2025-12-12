import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // 1. Inject Pixel Font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.username, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
      }
      navigate('/loading');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const pixelFont = "'Press Start 2P', monospace";

  return (
    <div style={{...styles.container, fontFamily: pixelFont}}>
      
      {/* Background Pattern */}
      <div style={styles.backgroundPattern}></div>

      <div style={styles.gameContent}>
        <h1 style={{ ...styles.mainTitle, fontFamily: pixelFont }}>POKE KO</h1>

        {/* Console Window Frame */}
        <div style={styles.windowFrame}>
          
          <div style={styles.windowHeader}>
             <div style={styles.windowDots}>
                <span style={styles.dot}></span>
                <span style={styles.dot}></span>
             </div>
             <span style={styles.headerTitle}>TRAINER AUTHENTICATION</span>
          </div>

          <div style={styles.windowBody}>
            <h2 style={{...styles.title, fontFamily: pixelFont}}>
                {isLogin ? ' LOGIN ' : ' REGISTER '}
            </h2>
            
            {error && <div style={{...styles.error, fontFamily: pixelFont}}>{error}</div>}
            
            <form onSubmit={handleSubmit} style={{width: '100%'}}>
              <div style={styles.formGroup}>
                <label style={styles.label}>USERNAME</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter Name..."
                  value={formData.username}
                  onChange={handleChange}
                  required
                  style={{...styles.input, fontFamily: pixelFont}}
                  autoComplete="off"
                />
              </div>
              
              {!isLogin && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>EMAIL</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter Email..."
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{...styles.input, fontFamily: pixelFont}}
                    autoComplete="off"
                  />
                </div>
              )}
              
              <div style={styles.formGroup}>
                <label style={styles.label}>PASSWORD</label>
                <input
                  type="password"
                  name="password"
                  placeholder="******"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{...styles.input, fontFamily: pixelFont}}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading} 
                style={{...styles.button, fontFamily: pixelFont}}
              >
                {loading ? 'LOADING...' : (isLogin ? 'START GAME' : 'NEW GAME')}
              </button>
            </form>
            
            <button 
              style={{...styles.toggleButton, fontFamily: pixelFont}}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "NO ACCOUNT? REGISTER" : "HAVE ACCOUNT? LOGIN"}
            </button>
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
    maxWidth: '400px',
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
  title: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    textAlign: 'center',
    color: '#000',
  },
  
  // Form Elements
  formGroup: {
    marginBottom: '20px',
    width: '100%',
  },
  label: {
    display: 'block',
    fontSize: '10px',
    marginBottom: '8px',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '3px solid #000',
    borderRadius: '0',
    fontSize: '12px',
    boxSizing: 'border-box',
    background: '#fff',
    outline: 'none',
    boxShadow: 'inset 3px 3px 0px #ddd',
  },
  button: {
    width: '100%',
    padding: '15px',
    marginTop: '10px',
    background: '#ffcb05',
    color: '#000',
    border: '3px solid #000',
    borderRadius: '0',
    fontSize: '12px',
    cursor: 'pointer',
    boxShadow: '4px 4px 0px #000',
    transition: 'all 0.1s',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  toggleButton: {
    width: '100%',
    padding: '10px',
    background: 'transparent',
    color: '#555',
    border: 'none',
    fontSize: '10px',
    cursor: 'pointer',
    marginTop: '20px',
    textDecoration: 'underline',
  },
  error: {
    background: '#ffcdcd',
    color: '#8a0000',
    border: '3px solid #8a0000',
    padding: '10px',
    marginBottom: '20px',
    textAlign: 'center',
    width: '100%',
    fontSize: '10px',
    boxSizing: 'border-box',
  }
};

export default Login;