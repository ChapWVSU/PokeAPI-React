import React, { useState, useEffect } from 'react';
import { pokemonAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import capitalize from '../utils/capitalize';
import Navbar from '../components/Navbar';

function BattleSimulator() {
  const [userPokemon, setUserPokemon] = useState(null);
  const [opponentPokemon, setOpponentPokemon] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [battleState, setBattleState] = useState('idle'); 
  const [showRewards, setShowRewards] = useState(false);
  const [rewards, setRewards] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const { user } = useAuth();

  const [battleStats, setBattleStats] = useState({
    turns: 0,
    damageTaken: 0,
    damageDealt: 0
  });

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const stats = await pokemonAPI.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const startBattle = async () => {
    try {
      setBattleState('loading');
      setBattleLog([]);
      setBattleStats({ turns: 0, damageTaken: 0, damageDealt: 0 });
      
      const userPoke = await pokemonAPI.getUserStarter();
      const opponentPoke = await pokemonAPI.getRandomOpponent(userPoke.level);

      setUserPokemon({ ...userPoke, currentHp: userPoke.maxHp });
      setOpponentPokemon({ ...opponentPoke, currentHp: opponentPoke.maxHp });
      setBattleState('battling');
      
      addToBattleLog(`A wild ${capitalize(opponentPoke.name)} appeared!`, 'system');
      addToBattleLog(`Go! ${capitalize(userPoke.name)}!`, 'system');
      addToBattleLog(`${capitalize(userPoke.name)} is level ${userPoke.level}`, 'info');
    } catch (error) {
      console.error('Failed to start battle:', error);
      setBattleState('idle');
    }
  };

  const addToBattleLog = (message, type = 'info') => {
    setBattleLog(prev => [...prev, { message, type, timestamp: new Date() }]);
  };

  const calculateDamage = (attacker, defender, move) => {
    const baseDamage = move.power || 40;
    const randomFactor = 0.8 + Math.random() * 0.4;
    const levelFactor = attacker.level / 50;
    
    let damage = Math.floor(baseDamage * randomFactor * levelFactor);
    
    const hasSTAB = attacker.types.includes(move.type);
    if (hasSTAB) {
      damage = Math.floor(damage * 1.5);
      addToBattleLog(`STAB boost!`, 'info');
    }
    
    const isCritical = Math.random() < 0.1;
    if (isCritical) {
      damage = Math.floor(damage * 1.5);
      addToBattleLog(`Critical hit!`, 'critical');
    }

    const accuracyCheck = move.accuracy ? (Math.random() * 100) <= move.accuracy : true;
    if (!accuracyCheck) {
      addToBattleLog(`${capitalize(attacker.name)}'s attack missed!`, 'miss');
      return 0;
    }
    
    return Math.max(1, damage);
  };

  const opponentAttack = async () => {
    if (!userPokemon || !opponentPokemon) return;

    const randomMove = opponentPokemon.moves[Math.floor(Math.random() * opponentPokemon.moves.length)];
    const damage = calculateDamage(opponentPokemon, userPokemon, randomMove);

    if (damage > 0) {
      setUserPokemon(prev => ({
        ...prev,
        currentHp: Math.max(0, prev.currentHp - damage)
      }));

      setBattleStats(prev => ({
        ...prev,
        damageTaken: prev.damageTaken + damage
      }));

      addToBattleLog(`${capitalize(opponentPokemon.name)} used ${randomMove.name.replace('-', ' ')}!`, 'opponent');
      addToBattleLog(`${capitalize(userPokemon.name)} took ${damage} damage!`, 'damage');

      setTimeout(() => {
        if (userPokemon.currentHp - damage <= 0) {
          endBattle('lost');
        }
      }, 1000);
    }
  };

  const userAttack = async (move) => {
    if (battleState !== 'battling') return;

    setBattleStats(prev => ({ ...prev, turns: prev.turns + 1 }));

    const damage = calculateDamage(userPokemon, opponentPokemon, move);
    
    if (damage > 0) {
      setOpponentPokemon(prev => ({
        ...prev,
        currentHp: Math.max(0, prev.currentHp - damage)
      }));

      setBattleStats(prev => ({
        ...prev,
        damageDealt: prev.damageDealt + damage
      }));

      addToBattleLog(`${capitalize(userPokemon.name)} used ${move.name.replace('-', ' ')}!`, 'user');
      addToBattleLog(`${capitalize(opponentPokemon.name)} took ${damage} damage!`, 'damage');

      if (opponentPokemon.currentHp - damage <= 0) {
        setTimeout(() => endBattle('win'), 1000);
        return;
      }

      setTimeout(() => opponentAttack(), 1500);
    } else {
      setTimeout(() => opponentAttack(), 1500);
    }
  };

  const endBattle = async (result) => {
    setBattleState(result);
    
    if (result === 'win') {
      addToBattleLog(`You defeated ${capitalize(opponentPokemon.name)}!`, 'victory');
      
      const battleData = {
        result: 'win',
        opponentLevel: opponentPokemon.level,
        damageTaken: battleStats.damageTaken,
        turns: battleStats.turns,
        opponentData: opponentPokemon
      };
      
      try {
        const rewardData = await pokemonAPI.submitBattleResult(battleData);
        setRewards(rewardData);
        
        if (rewardData.newLevel && rewardData.newExperience !== undefined) {
          setUserPokemon(prev => ({
            ...prev,
            level: rewardData.newLevel,
            experience: rewardData.newExperience,
            expForNextLevel: rewardData.expForNextLevel,
            maxHp: 100 + (rewardData.newLevel * 5),
            currentHp: 100 + (rewardData.newLevel * 5)
          }));
        }
        
        if (rewardData.levelsGained > 0) {
          setShowLevelUp(true);
        } else {
          setShowRewards(true);
        }
        
        loadUserStats();
      } catch (error) {
        console.error('Failed to submit battle result:', error);
      }
      
    } else if (result === 'lost') {
      addToBattleLog(`Your ${capitalize(userPokemon.name)} fainted!`, 'defeat');
      const battleData = {
        result: 'lost',
        opponentLevel: opponentPokemon.level,
        damageTaken: battleStats.damageTaken,
        turns: battleStats.turns,
        opponentData: opponentPokemon
      };
      
      try {
        const rewardData = await pokemonAPI.submitBattleResult(battleData);
        setRewards(rewardData);
        setShowRewards(true);
        loadUserStats();
      } catch (error) {
        console.error('Failed to submit battle result:', error);
      }
    } else if (result === 'ran') {
      addToBattleLog('Got away safely!', 'system');
    }
  };

  const runFromBattle = () => {
    addToBattleLog('You ran from the battle!', 'system');
    endBattle('ran');
  };

  const getHpBarColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage > 60) return '#4dad5b'; 
    if (percentage > 30) return '#f39c12'; 
    return '#d30a40'; 
  };

  const getExpBarColor = (current, max) => {
    return '#3b4cca'; 
  };

  const typeColors = {
    normal: '#A8A878', fire: '#F08030', water: '#6890F0', grass: '#78C850',
    electric: '#F8D030', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
    ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
    rock: '#B8A038', ghost: '#705898', dark: '#705848', dragon: '#7038F8',
    steel: '#B8B8D0', fairy: '#EE99AC'
  };

  const getTypeStyle = (type) => ({
    padding: '2px 6px',
    border: '1px solid rgba(0,0,0,0.2)',
    color: 'white',
    textTransform: 'uppercase',
    fontSize: '8px',
    background: typeColors[type] || '#A8A878',
    textShadow: '1px 1px 0 #000',
    display: 'inline-block',
    marginRight: '4px'
  });

  const HpBar = ({ current, max, label }) => (
    <div style={styles.hpContainer}>
      <div style={styles.hpInfo}>
        <span>HP</span>
      </div>
      <div style={styles.hpBarWrapper}>
        <div style={styles.hpBarBackground}>
            <div 
            style={{
                ...styles.hpBarFill,
                width: `${(current / max) * 100}%`,
                background: getHpBarColor(current, max)
            }}
            />
        </div>
        <div style={styles.hpText}>{current}/{max}</div>
      </div>
    </div>
  );

  const ExpBar = ({ current, max }) => (
    <div style={styles.expContainer}>
      <div style={styles.expBarBackground}>
        <div 
          style={{
            ...styles.expBarFill,
            width: `${Math.min(100, (current / max) * 100)}%`,
            background: getExpBarColor(current, max)
          }}
        />
      </div>
    </div>
  );

  const pixelFont = "'Press Start 2P', monospace";

  return (
    <div style={{ ...styles.container, fontFamily: pixelFont }}>
      
      <div style={styles.backgroundPattern}></div>

      <div style={{zIndex: 10, width: '100%'}}>
        <Navbar />
      </div>

      <div style={styles.gameContent}>
        <h1 style={{ ...styles.mainTitle, fontFamily: pixelFont }}>BATTLE SIMULATOR</h1>

        <div style={styles.windowFrame}>
            <div style={styles.windowHeader}>
                <div style={styles.windowDots}>
                    <span style={styles.dot}></span>
                    <span style={styles.dot}></span>
                </div>
                <span style={styles.headerTitle}></span>
            </div>

            <div style={styles.windowBody}>
                
                <div style={styles.battleArena}>
                  
                  {battleState === 'idle' && (
                    <div style={styles.idleState}>
                      <div style={styles.menuHeader}> MAIN MENU </div>
                      <p style={{marginBottom: '20px', fontSize: '10px', lineHeight: '1.5'}}>
                        TRAIN YOUR POKEMON AGAINST WILD ENCOUNTERS!
                      </p>
                      <button onClick={startBattle} style={styles.startButton}>
                        START BATTLE
                      </button>
                    </div>
                  )}

                  {battleState === 'loading' && (
                    <div style={styles.loadingState}>
                      <h2 style={{animation: 'blink 1s infinite'}}>SEARCHING...</h2>
                      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
                    </div>
                  )}

                  {(battleState === 'battling' || battleState === 'won' || battleState === 'lost' || battleState === 'ran') && (
                    <div style={styles.battleScene}>
                      
                      <div style={styles.opponentArea}>
                        <div style={styles.statusBox}>
                            <div style={styles.nameRow}>
                                <span>{opponentPokemon?.name.toUpperCase()}</span>
                                <span>Lv{opponentPokemon?.level}</span>
                            </div>
                            <HpBar current={opponentPokemon?.currentHp} max={opponentPokemon?.maxHp} label="" />
                        </div>
                        <div style={styles.opponentSpriteBox}>
                            <img 
                                src={opponentPokemon?.sprites?.front_default} 
                                alt="Opponent"
                                style={styles.opponentSprite}
                            />
                            <div style={styles.platform}></div>
                        </div>
                      </div>

                      <div style={styles.userArea}>
                        <div style={styles.userSpriteBox}>
                            <img 
                                src={userPokemon?.sprites?.back_default} 
                                alt="User"
                                style={styles.userSprite}
                            />
                            <div style={styles.platform}></div>
                        </div>
                        <div style={styles.statusBox}>
                            <div style={styles.nameRow}>
                                <span>{userPokemon?.name.toUpperCase()}</span>
                                <span>Lv{userPokemon?.level}</span>
                            </div>
                            <HpBar current={userPokemon?.currentHp} max={userPokemon?.maxHp} label="" />
                            <div style={styles.expRow}>
                                <span style={{fontSize: '8px', marginRight: '5px'}}>EXP</span>
                                <ExpBar current={userPokemon?.experience} max={userPokemon?.expForNextLevel} />
                            </div>
                        </div>
                      </div>

                      <div style={styles.bottomSection}>
                          <div style={styles.dialogueBox}>
                            {battleLog.slice(-1).map((log, index) => (
                                <div key={index} style={styles.logText}>
                                    {log.message}
                                    <span style={styles.blinkingCursor}>▼</span>
                                </div>
                            ))}
                          </div>

                          {battleState === 'battling' && (
                            <div style={styles.moveMenu}>
                                {userPokemon?.moves.map((move, index) => (
                                    <button
                                        key={index}
                                        onClick={() => userAttack(move)}
                                        style={styles.moveButton}
                                    >
                                        {move.name.toUpperCase()}
                                        <div style={styles.ppText}>{move.type}</div>
                                    </button>
                                ))}
                                <button onClick={runFromBattle} style={{...styles.moveButton, background: '#e74c3c', color: 'white'}}>
                                    RUN
                                </button>
                            </div>
                          )}
                      </div>

                    </div>
                  )}

                  {showLevelUp && rewards && (
                    <div style={styles.popupOverlay}>
                      <div style={styles.popupBox}>
                        <div style={styles.popupHeader}>LEVEL UP!</div>
                        <div style={styles.popupContent}>
                            <p>{userPokemon?.name.toUpperCase()} grew to</p>
                            <p style={{fontSize: '14px', marginTop: '10px'}}>LV. {rewards.newLevel}!</p>
                        </div>
                        <button 
                          onClick={() => { setShowLevelUp(false); setShowRewards(true); }}
                          style={styles.continueButton}
                        >
                          NEXT ➤
                        </button>
                      </div>
                    </div>
                  )}

                  {showRewards && rewards && (
                    <div style={styles.popupOverlay}>
                      <div style={styles.popupBox}>
                        <div style={styles.popupHeader}>RESULTS</div>
                        <div style={styles.popupContent}>
                            {rewards.expGained > 0 && <p>EXP: +{rewards.expGained}</p>}
                            <p>TROPHIES: +{rewards.trophiesEarned}</p>
                            <p>COINS: +{rewards.coinsEarned}</p>
                        </div>
                        <button 
                          onClick={() => { setShowRewards(false); setBattleState('idle'); }}
                          style={styles.continueButton}
                        >
                          FINISH ➤
                        </button>
                      </div>
                    </div>
                  )}

                  {battleState === 'ran' && (
                    <div style={styles.popupOverlay}>
                      <div style={styles.popupBox}>
                        <div style={styles.popupHeader}>ESCAPED</div>
                        <div style={styles.popupContent}>
                            <p>GOT AWAY SAFELY!</p>
                        </div>
                        <button 
                          onClick={() => setBattleState('idle')}
                          style={styles.continueButton}
                        >
                          RETURN ➤
                        </button>
                      </div>
                    </div>
                  )}

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
    justifyContent: 'flex-start',
    position: 'relative',
    overflowY: 'auto',
    backgroundColor: '#202020',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    opacity: 0.1,
    backgroundImage: `linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%)`,
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
  windowFrame: {
    background: '#f8f8f8',
    border: '4px solid #000',
    width: '100%',
    maxWidth: '1000px',
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
  battleArena: { width: '100%', position: 'relative' },
  idleState: { textAlign: 'center', padding: '40px', border: '2px solid #000', background: '#fff' },
  menuHeader: { fontSize: '14px', marginBottom: '20px', borderBottom: '2px dashed #000', display: 'inline-block', paddingBottom: '5px' },
  startButton: { background: '#ffcb05', border: '3px solid #000', padding: '15px 30px', fontSize: '12px', cursor: 'pointer', fontFamily: "'Press Start 2P', monospace", boxShadow: '4px 4px 0 #000' },
  loadingState: { textAlign: 'center', padding: '60px' },
  battleScene: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '20px',
  },
  opponentArea: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '200px',
    paddingBottom: '20px',

  },
  userArea: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '220px',
    marginBottom: '20px',
  },
  statusBox: {
    background: '#fff',
    border: '3px solid #000',
    padding: '10px',
    width: '200px',
    position: 'relative',
    boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
    zIndex: 10,
  },
  nameRow: { display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '5px', fontWeight: 'bold' },
  hpContainer: { display: 'flex', alignItems: 'center', background: '#333', padding: '2px', borderRadius: '2px' },
  hpInfo: { color: '#ffde00', fontSize: '8px', padding: '0 4px', background: '#333' },
  hpBarWrapper: { flex: 1, background: '#fff', height: '8px', border: '1px solid #fff', position: 'relative' },
  hpBarBackground: { width: '100%', height: '100%', background: '#555' },
  hpBarFill: { height: '100%', transition: 'width 0.5s ease' },
  hpText: { fontSize: '6px', textAlign: 'right', marginTop: '2px', color: '#000' },
  opponentSpriteBox: { position: 'relative', marginRight: '30px' },
  userSpriteBox: { position: 'relative', marginLeft: '30px' },
  opponentSprite: {
    width: '250px',
    height: '250px',
    imageRendering: 'pixelated',
    zIndex: 2,
    position: 'relative',
  },
  userSprite: {
    width: '280px',
    height: '280px',
    imageRendering: 'pixelated',
    zIndex: 2,
    position: 'relative',
  },
  platform: {
    width: '300px',
    height: '60px',
    background: '#e0e0e0',
    border: '2px solid #ccc',
    borderRadius: '50%',
    position: 'absolute',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1,
  },
  expRow: { display: 'flex', alignItems: 'center', marginTop: '5px' },
  expContainer: { flex: 1, height: '4px', background: '#555', border: '1px solid #000' },
  expBarFill: { height: '100%', background: '#3b4cca' },
  bottomSection: {
    display: 'flex',
    gap: '15px',
    height: '140px',
    border: '4px solid #3b4cca',
    background: '#222',
    padding: '10px',
    zIndex: 20,
    position: 'relative'
  },
  dialogueBox: { flex: 2, background: '#fff', border: '3px solid #fff', borderRadius: '4px', padding: '15px', fontSize: '10px', lineHeight: '1.8', color: '#000', position: 'relative' },
  logText: { position: 'relative' },
  blinkingCursor: { color: '#d30a40', animation: 'blink 1s infinite', marginLeft: '5px' },
  moveMenu: { flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', background: '#fff', border: '3px solid #fff', padding: '5px' },
  moveButton: { background: '#f8f8f8', border: '2px solid #000', fontSize: '8px', fontFamily: "'Press Start 2P', monospace", cursor: 'pointer', textAlign: 'left', padding: '5px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  ppText: { fontSize: '6px', color: '#666', marginTop: '2px' },
  popupOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  popupBox: { background: '#fff', border: '4px solid #000', padding: '20px', textAlign: 'center', minWidth: '200px', boxShadow: '8px 8px 0 rgba(0,0,0,0.5)' },
  popupHeader: { background: '#ffcb05', padding: '5px', fontSize: '12px', border: '2px solid #000', marginBottom: '15px' },
  popupContent: { fontSize: '10px', lineHeight: '2', marginBottom: '15px' },
  continueButton: { background: 'transparent', border: 'none', fontSize: '10px', fontFamily: "'Press Start 2P', monospace", cursor: 'pointer', color: '#d30a40', animation: 'blink 1s infinite' }
};

export default BattleSimulator;