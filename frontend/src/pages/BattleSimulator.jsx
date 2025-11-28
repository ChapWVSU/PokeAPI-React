import React, { useState, useEffect } from 'react';
import { pokemonAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

function BattleSimulator() {
  const [userPokemon, setUserPokemon] = useState(null);
  const [opponentPokemon, setOpponentPokemon] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [battleState, setBattleState] = useState('idle'); // idle, battling, won, lost, ran
  const [showRewards, setShowRewards] = useState(false);
  const [rewards, setRewards] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const { user } = useAuth();

  // Battle stats
  const [battleStats, setBattleStats] = useState({
    turns: 0,
    damageTaken: 0,
    damageDealt: 0
  });

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
      
      const [userPoke, opponentPoke] = await Promise.all([
        pokemonAPI.getUserStarter(),
        pokemonAPI.getRandomOpponent()
      ]);

      setUserPokemon({ ...userPoke, currentHp: userPoke.maxHp });
      setOpponentPokemon({ ...opponentPoke, currentHp: opponentPoke.maxHp });
      setBattleState('battling');
      
      addToBattleLog(`A wild ${opponentPoke.name} appeared!`, 'system');
      addToBattleLog(`Go! ${userPoke.name}!`, 'system');
      addToBattleLog(`${userPoke.name} is level ${userPoke.level} (${userPoke.experience}/${userPoke.expForNextLevel} EXP)`, 'info');
    } catch (error) {
      console.error('Failed to start battle:', error);
      setBattleState('idle');
    }
  };

  const addToBattleLog = (message, type = 'info') => {
    setBattleLog(prev => [...prev, { message, type, timestamp: new Date() }]);
  };

  const calculateDamage = (attacker, defender, move) => {
    // Simple damage calculation
    const baseDamage = move.power || 40;
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    const levelFactor = attacker.level / 50;
    
    let damage = Math.floor(baseDamage * randomFactor * levelFactor);
    
    // STAB (Same Type Attack Bonus) - 1.5x if move type matches Pokemon type
    const hasSTAB = attacker.types.includes(move.type);
    if (hasSTAB) {
      damage = Math.floor(damage * 1.5);
      addToBattleLog(`STAB boost!`, 'info');
    }
    
    // Critical hit chance (10%)
    const isCritical = Math.random() < 0.1;
    if (isCritical) {
      damage = Math.floor(damage * 1.5);
      addToBattleLog(`Critical hit!`, 'critical');
    }

    // Accuracy check
    const accuracyCheck = move.accuracy ? (Math.random() * 100) <= move.accuracy : true;
    if (!accuracyCheck) {
      addToBattleLog(`${attacker.name}'s attack missed!`, 'miss');
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

      addToBattleLog(`${opponentPokemon.name} used ${randomMove.name.replace('-', ' ')}!`, 'opponent');
      addToBattleLog(`${userPokemon.name} took ${damage} damage!`, 'damage');

      // Check if user Pokemon fainted
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

    // User attacks
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

      addToBattleLog(`${userPokemon.name} used ${move.name.replace('-', ' ')}!`, 'user');
      addToBattleLog(`${opponentPokemon.name} took ${damage} damage!`, 'damage');

      // Check if opponent fainted
      if (opponentPokemon.currentHp - damage <= 0) {
        setTimeout(() => endBattle('win'), 1000);
        return;
      }

      // Opponent attacks back
      setTimeout(() => opponentAttack(), 1500);
    } else {
      // Attack missed, opponent still attacks
      setTimeout(() => opponentAttack(), 1500);
    }
  };

  const endBattle = async (result) => {
    setBattleState(result);
    
    if (result === 'win') {
      addToBattleLog(`You defeated ${opponentPokemon.name}!`, 'victory');
      
      // Calculate and show rewards
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
        
        // Update user Pokemon with new level/exp
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
        
        // Show level up popup if levels were gained
        if (rewardData.levelsGained > 0) {
          setShowLevelUp(true);
        } else {
          setShowRewards(true);
        }
        
        loadUserStats(); // Refresh stats
      } catch (error) {
        console.error('Failed to submit battle result:', error);
      }
      
    } else if (result === 'lost') {
      addToBattleLog(`Your ${userPokemon.name} fainted!`, 'defeat');
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
      setBattleState('ran');
    }
  };

  const runFromBattle = () => {
    addToBattleLog('You ran from the battle!', 'system');
    endBattle('ran');
  };

  const getHpBarColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage > 60) return '#2ecc71';
    if (percentage > 30) return '#f39c12';
    return '#e74c3c';
  };

  const getExpBarColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage > 70) return '#9b59b6';
    if (percentage > 40) return '#3498db';
    return '#1abc9c';
  };

  const getTypeStyle = (type) => ({
    padding: '3px 8px',
    borderRadius: '12px',
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: '0.7em',
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

  const HpBar = ({ current, max, label }) => (
    <div style={styles.hpContainer}>
      <div style={styles.hpInfo}>
        <span>{label}</span>
        <span>{current} / {max} HP</span>
      </div>
      <div style={styles.hpBarBackground}>
        <div 
          style={{
            ...styles.hpBarFill,
            width: `${(current / max) * 100}%`,
            background: getHpBarColor(current, max)
          }}
        />
      </div>
    </div>
  );

  const ExpBar = ({ current, max, level }) => (
    <div style={styles.expContainer}>
      <div style={styles.expInfo}>
        <span>Lv. {level}</span>
        <span>{current} / {max} EXP</span>
      </div>
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

  return (
    <div style={styles.pageContainer}>
      <Navbar />
      
      <div style={styles.container}>
        {/* User Stats */}
        {userStats && (
          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>🏆 Trophies:</span>
              <span style={styles.statValue}>{userStats.trophies}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>🪙 Coins:</span>
              <span style={styles.statValue}>{userStats.coins}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>⚔️ Battles:</span>
              <span style={styles.statValue}>{userStats.totalBattles} ({userStats.wins}W)</span>
            </div>
          </div>
        )}

        {/* Battle Arena */}
        <div style={styles.battleArena}>
          {battleState === 'idle' && (
            <div style={styles.idleState}>
              <h1>Battle Simulator</h1>
              <p>Test your skills against random Pokemon!</p>
              <button onClick={startBattle} style={styles.startButton}>
                Start Battle
              </button>
            </div>
          )}

          {battleState === 'loading' && (
            <div style={styles.loadingState}>
              <div style={styles.loadingSpinner}></div>
              <p>Looking for opponent...</p>
            </div>
          )}

          {(battleState === 'battling' || battleState === 'won' || battleState === 'lost') && (
            <>
              {/* Opponent Pokemon */}
              <div style={styles.opponentSection}>
                {opponentPokemon && (
                  <>
                    <div style={styles.pokemonInfo}>
                      <h3>{opponentPokemon.name} Lv.{opponentPokemon.level}</h3>
                      <div style={styles.types}>
                        {opponentPokemon.types.map(type => (
                          <span key={type} style={getTypeStyle(type)}>
                            {type}
                          </span>
                        ))}
                      </div>
                      <HpBar 
                        current={opponentPokemon.currentHp} 
                        max={opponentPokemon.maxHp} 
                        label="Opponent"
                      />
                    </div>
                    <img 
                      src={opponentPokemon.sprites.front_default} 
                      alt={opponentPokemon.name}
                      style={styles.pokemonSprite}
                    />
                  </>
                )}
              </div>

              {/* Battle Log */}
              <div style={styles.battleLog}>
                <h4>Battle Log</h4>
                <div style={styles.logContent}>
                  {battleLog.slice(-6).map((log, index) => (
                    <div 
                      key={index} 
                      style={{
                        ...styles.logEntry,
                        ...styles[log.type]
                      }}
                    >
                      {log.message}
                    </div>
                  ))}
                </div>
              </div>

              {/* User Pokemon */}
              <div style={styles.userSection}>
                {userPokemon && (
                  <>
                    <img 
                      src={userPokemon.sprites.front_default} 
                      alt={userPokemon.name}
                      style={styles.pokemonSprite}
                    />
                    <div style={styles.pokemonInfo}>
                      <h3>{userPokemon.name}</h3>
                      <ExpBar 
                        current={userPokemon.experience} 
                        max={userPokemon.expForNextLevel} 
                        level={userPokemon.level}
                      />
                      <div style={styles.types}>
                        {userPokemon.types.map(type => (
                          <span key={type} style={getTypeStyle(type)}>
                            {type}
                          </span>
                        ))}
                      </div>
                      <HpBar 
                        current={userPokemon.currentHp} 
                        max={userPokemon.maxHp} 
                        label="Your Pokemon"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Battle Controls */}
              {battleState === 'battling' && (
                <div style={styles.controls}>
                  <h4>Choose Your Move:</h4>
                  <div style={styles.movesGrid}>
                    {userPokemon?.moves.map((move, index) => (
                      <button
                        key={index}
                        onClick={() => userAttack(move)}
                        style={{
                          ...styles.moveButton,
                          background: typeColors[move.type] || '#3498db'
                        }}
                      >
                        <span style={styles.moveName}>
                          {move.name.replace('-', ' ')}
                        </span>
                        <div style={styles.moveDetails}>
                          <span style={styles.movePower}>Power: {move.power}</span>
                          <span style={styles.moveAccuracy}>Acc: {move.accuracy}%</span>
                        </div>
                        <span style={styles.moveType}>{move.type}</span>
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={runFromBattle}
                    style={styles.runButton}
                  >
                    🏃 Run
                  </button>
                </div>
              )}
            </>
          )}

          {/* Level Up Popup */}
          {showLevelUp && rewards && (
            <div style={styles.rewardsOverlay}>
              <div style={styles.levelUpPopup}>
                <h2 style={styles.levelUpTitle}>🎉 Level Up! 🎉</h2>
                <div style={styles.levelUpContent}>
                  <div style={styles.levelUpMessage}>
                    <strong>{userPokemon?.name}</strong> grew to <strong>Level {rewards.newLevel}!</strong>
                  </div>
                  {rewards.levelsGained > 1 && (
                    <div style={styles.multiLevel}>
                      (+{rewards.levelsGained} levels!)
                    </div>
                  )}
                  <div style={styles.levelUpStats}>
                    <div>+{rewards.expGained} EXP</div>
                    <div>Max HP increased!</div>
                    <div>Moves got stronger!</div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowLevelUp(false);
                    setShowRewards(true);
                  }}
                  style={styles.continueButton}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Rewards Popup */}
          {showRewards && rewards && (
            <div style={styles.rewardsOverlay}>
              <div style={styles.rewardsPopup}>
                <h2>Battle Results</h2>
                <div style={styles.rewardsContent}>
                  {rewards.expGained > 0 && (
                    <div style={styles.rewardItem}>
                      <span style={styles.rewardIcon}>⭐</span>
                      <span style={styles.rewardText}>
                        +{rewards.expGained} EXP
                      </span>
                    </div>
                  )}
                  <div style={styles.rewardItem}>
                    <span style={styles.rewardIcon}>🏆</span>
                    <span style={styles.rewardText}>
                      +{rewards.trophiesEarned} Trophies
                    </span>
                  </div>
                  <div style={styles.rewardItem}>
                    <span style={styles.rewardIcon}>🪙</span>
                    <span style={styles.rewardText}>
                      +{rewards.coinsEarned} Coins
                    </span>
                  </div>
                  {rewards.bonusMultiplier > 1 && (
                    <div style={styles.bonusInfo}>
                      <span style={styles.bonusText}>
                        Bonus Multiplier: {rewards.bonusMultiplier}x
                      </span>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setShowRewards(false);
                    setBattleState('idle');
                  }}
                  style={styles.continueButton}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
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
    paddingTop: '80px', // Add padding to account for navbar
  },
  statsBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    marginBottom: '30px',
    background: 'rgba(255,255,255,0.1)',
    padding: '15px',
    borderRadius: '10px',
    backdropFilter: 'blur(10px)',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: 'white',
  },
  statLabel: {
    fontSize: '0.9em',
    opacity: 0.8,
    marginBottom: '5px',
  },
  statValue: {
    fontSize: '1.2em',
    fontWeight: 'bold',
  },
  battleArena: {
    maxWidth: '800px',
    margin: '0 auto',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '30px',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255,255,255,0.2)',
  },
  idleState: {
    textAlign: 'center',
    color: 'white',
  },
  startButton: {
    background: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    fontSize: '1.2em',
    borderRadius: '10px',
    cursor: 'pointer',
    marginTop: '20px',
  },
  loadingState: {
    textAlign: 'center',
    color: 'white',
  },
  loadingSpinner: {
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
  },
  opponentSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  userSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '30px',
  },
  pokemonInfo: {
    color: 'white',
    flex: 1,
  },
  types: {
    display: 'flex',
    gap: '5px',
    marginBottom: '10px',
  },
  pokemonSprite: {
    width: '150px',
    height: '150px',
    imageRendering: 'pixelated',
  },
  hpContainer: {
    marginTop: '10px',
  },
  expContainer: {
    marginBottom: '10px',
  },
  hpInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px',
    fontSize: '0.9em',
  },
  expInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px',
    fontSize: '0.9em',
  },
  hpBarBackground: {
    background: '#34495e',
    borderRadius: '10px',
    height: '10px',
    overflow: 'hidden',
  },
  expBarBackground: {
    background: '#2c3e50',
    borderRadius: '10px',
    height: '8px',
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  expBarFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  battleLog: {
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '10px',
    padding: '15px',
    margin: '20px 0',
    color: 'white',
  },
  logContent: {
    maxHeight: '150px',
    overflowY: 'auto',
  },
  logEntry: {
    padding: '5px 0',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  user: {
    color: '#3498db',
  },
  opponent: {
    color: '#e74c3c',
  },
  damage: {
    color: '#f39c12',
  },
  critical: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  victory: {
    color: '#2ecc71',
    fontWeight: 'bold',
  },
  defeat: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  miss: {
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  info: {
    color: '#3498db',
    fontSize: '0.9em',
  },
  controls: {
    marginTop: '30px',
    color: 'white',
  },
  movesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    margin: '15px 0',
  },
  moveButton: {
    color: 'white',
    border: 'none',
    padding: '15px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
  },
  moveName: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
    fontSize: '1.1em',
  },
  moveDetails: {
    display: 'flex',
    gap: '10px',
    fontSize: '0.8em',
    opacity: 0.9,
  },
  moveType: {
    fontSize: '0.7em',
    background: 'rgba(0,0,0,0.3)',
    padding: '2px 8px',
    borderRadius: '10px',
    textTransform: 'uppercase',
  },
  runButton: {
    background: 'rgba(231, 76, 60, 0.8)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    marginTop: '10px',
  },
  rewardsOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  levelUpPopup: {
    background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
    padding: '30px',
    borderRadius: '15px',
    textAlign: 'center',
    color: 'white',
    minWidth: '350px',
    border: '3px solid gold',
  },
  levelUpTitle: {
    fontSize: '2em',
    marginBottom: '20px',
    textShadow: '2px 2px 0 rgba(0,0,0,0.3)',
  },
  levelUpContent: {
    margin: '20px 0',
  },
  levelUpMessage: {
    fontSize: '1.3em',
    marginBottom: '15px',
    fontWeight: 'bold',
  },
  multiLevel: {
    fontSize: '1.1em',
    color: '#ffeb3b',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  levelUpStats: {
    background: 'rgba(255,255,255,0.2)',
    padding: '15px',
    borderRadius: '10px',
    fontSize: '1em',
  },
  rewardsPopup: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '30px',
    borderRadius: '15px',
    textAlign: 'center',
    color: 'white',
    minWidth: '300px',
  },
  rewardsContent: {
    margin: '20px 0',
  },
  rewardItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    margin: '10px 0',
    fontSize: '1.2em',
  },
  rewardIcon: {
    fontSize: '1.5em',
  },
  bonusInfo: {
    marginTop: '15px',
    padding: '10px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '5px',
  },
  bonusText: {
    color: '#ffeb3b',
    fontWeight: 'bold',
  },
  continueButton: {
    background: '#2ecc71',
    color: 'white',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
  }
};

export default BattleSimulator;