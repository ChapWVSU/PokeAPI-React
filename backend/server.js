import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './database.js';

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

<<<<<<< HEAD
=======
// Helper function to get real moves from PokeAPI
async function getRealMoves(moves) {
  try {
    // Take first 4 moves that have actual move data
    const availableMoves = moves.slice(0, 6);
    
    const movePromises = availableMoves.map(async (move) => {
      try {
        const response = await fetch(move.move.url);
        const moveData = await response.json();
        
        // Only include moves that have power and are from main series games
        if (moveData.power && moveData.damage_class.name !== 'status') {
          return {
            name: moveData.name,
            power: moveData.power,
            type: moveData.type.name,
            accuracy: moveData.accuracy
          };
        }
        return null;
      } catch (error) {
        console.error(`Failed to fetch move: ${move.move.name}`, error);
        return null;
      }
    });

    const movesWithData = await Promise.all(movePromises);
    
    // Filter out null moves and take first 4 valid moves
    const validMoves = movesWithData.filter(move => move !== null).slice(0, 4);
    
    // If we don't have enough moves with power, add some default moves based on type
    if (validMoves.length < 4) {
      const defaultMoves = [
        { name: 'tackle', power: 40, type: 'normal', accuracy: 100 },
        { name: 'quick-attack', power: 40, type: 'normal', accuracy: 100 },
        { name: 'body-slam', power: 85, type: 'normal', accuracy: 100 },
        { name: 'take-down', power: 90, type: 'normal', accuracy: 85 }
      ];
      return [...validMoves, ...defaultMoves.slice(0, 4 - validMoves.length)];
    }

    return validMoves;
  } catch (error) {
    console.error('Error getting real moves:', error);
    // Return default moves as fallback
    return [
      { name: 'tackle', power: 40, type: 'normal', accuracy: 100 },
      { name: 'quick-attack', power: 40, type: 'normal', accuracy: 100 },
      { name: 'body-slam', power: 85, type: 'normal', accuracy: 100 },
      { name: 'take-down', power: 90, type: 'normal', accuracy: 85 }
    ];
  }
}

// Helper function to get type-based default moves
function getTypeBasedMoves(types) {
  const typeMoveMap = {
    fire: [
      { name: 'ember', power: 40, type: 'fire', accuracy: 100 },
      { name: 'flamethrower', power: 90, type: 'fire', accuracy: 100 },
      { name: 'fire-blast', power: 110, type: 'fire', accuracy: 85 },
      { name: 'fire-punch', power: 75, type: 'fire', accuracy: 100 }
    ],
    water: [
      { name: 'water-gun', power: 40, type: 'water', accuracy: 100 },
      { name: 'surf', power: 90, type: 'water', accuracy: 100 },
      { name: 'hydro-pump', power: 110, type: 'water', accuracy: 80 },
      { name: 'bubble-beam', power: 65, type: 'water', accuracy: 100 }
    ],
    grass: [
      { name: 'vine-whip', power: 45, type: 'grass', accuracy: 100 },
      { name: 'razor-leaf', power: 55, type: 'grass', accuracy: 95 },
      { name: 'solar-beam', power: 120, type: 'grass', accuracy: 100 },
      { name: 'seed-bomb', power: 80, type: 'grass', accuracy: 100 }
    ],
    electric: [
      { name: 'thunder-shock', power: 40, type: 'electric', accuracy: 100 },
      { name: 'thunderbolt', power: 90, type: 'electric', accuracy: 100 },
      { name: 'thunder', power: 110, type: 'electric', accuracy: 70 },
      { name: 'spark', power: 65, type: 'electric', accuracy: 100 }
    ],
    psychic: [
      { name: 'confusion', power: 50, type: 'psychic', accuracy: 100 },
      { name: 'psybeam', power: 65, type: 'psychic', accuracy: 100 },
      { name: 'psychic', power: 90, type: 'psychic', accuracy: 100 },
      { name: 'psywave', power: 80, type: 'psychic', accuracy: 100 }
    ]
  };

  const defaultMoves = [
    { name: 'tackle', power: 40, type: 'normal', accuracy: 100 },
    { name: 'quick-attack', power: 40, type: 'normal', accuracy: 100 },
    { name: 'body-slam', power: 85, type: 'normal', accuracy: 100 },
    { name: 'take-down', power: 90, type: 'normal', accuracy: 85 }
  ];

  // Try to get moves based on Pokemon's primary type
  const primaryType = types[0];
  if (typeMoveMap[primaryType]) {
    return [...typeMoveMap[primaryType].slice(0, 2), ...defaultMoves.slice(0, 2)];
  }

  return defaultMoves;
}

// Calculate experience required for next level
function getExpForLevel(level) {
  return Math.floor(100 * Math.pow(1.2, level - 1));
}

// Calculate experience gained from battle
function calculateExpGained(opponentLevel, userLevel, result, bonusMultiplier) {
  let baseExp = opponentLevel * 10;
  
  if (result === 'win') {
    baseExp *= 2;
  }
  
  // Level difference bonus/penalty
  const levelDiff = opponentLevel - userLevel;
  if (levelDiff > 0) {
    baseExp *= (1 + levelDiff * 0.1); // Bonus for beating higher level opponents
  }
  
  return Math.floor(baseExp * bonusMultiplier);
}

>>>>>>> zchandro-branch
// Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
<<<<<<< HEAD
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
=======
      'INSERT INTO users (username, email, password, trophies, coins) VALUES (?, ?, ?, 0, 100)',
>>>>>>> zchandro-branch
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        const token = jwt.sign({ userId: this.lastID, username }, JWT_SECRET);
        res.json({ 
          message: 'User created successfully', 
          token,
          user: { id: this.lastID, username, email }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

<<<<<<< HEAD
      const token = jwt.sign({ userId: user.id, username }, JWT_SECRET);
      res.json({
        message: 'Login successful',
        token,
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          hasChosenStarter: !!user.chosen_pokemon_id
        }
      });
=======
      // Check if user has a starter Pokemon
      db.get(
        'SELECT COUNT(*) as hasStarter FROM user_pokemon WHERE user_id = ? AND is_starter = 1',
        [user.id],
        (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          const token = jwt.sign({ userId: user.id, username }, JWT_SECRET);
          res.json({
            message: 'Login successful',
            token,
            user: { 
              id: user.id, 
              username: user.username, 
              email: user.email,
              hasChosenStarter: result.hasStarter > 0
            }
          });
        }
      );
>>>>>>> zchandro-branch
    }
  );
});

// Get random Pokemon for gacha
app.get('/api/random-pokemon', authenticateToken, async (req, res) => {
  try {
    const randomId = Math.floor(Math.random() * 151) + 1; // First gen Pokemon
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
    const pokemonData = await response.json();
    
    const simplifiedData = {
      id: pokemonData.id,
      name: pokemonData.name,
      sprites: pokemonData.sprites,
      types: pokemonData.types.map(typeInfo => typeInfo.type.name)
    };

    res.json(simplifiedData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Pokemon' });
  }
});

// Choose starter Pokemon
app.post('/api/choose-starter', authenticateToken, (req, res) => {
  const { pokemon } = req.body;
  const userId = req.user.userId;

  db.serialize(() => {
    // Check if user already has a starter
    db.get(
<<<<<<< HEAD
      'SELECT chosen_pokemon_id FROM users WHERE id = ?',
      [userId],
      (err, user) => {
=======
      'SELECT id FROM user_pokemon WHERE user_id = ? AND is_starter = 1',
      [userId],
      (err, existingStarter) => {
>>>>>>> zchandro-branch
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

<<<<<<< HEAD
        if (user.chosen_pokemon_id) {
          return res.status(400).json({ error: 'Starter already chosen' });
        }

        // Insert pokemon and update user
        db.run(
          'INSERT INTO user_pokemon (user_id, pokemon_id, pokemon_name, pokemon_data, is_starter) VALUES (?, ?, ?, ?, ?)',
          [userId, pokemon.id, pokemon.name, JSON.stringify(pokemon), 1],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to save Pokemon' });
            }

            db.run(
              'UPDATE users SET chosen_pokemon_id = ? WHERE id = ?',
              [pokemon.id, userId],
              (err) => {
                if (err) {
                  return res.status(500).json({ error: 'Failed to update user' });
                }

                res.json({ 
                  message: 'Starter Pokemon chosen successfully',
                  pokemon 
                });
              }
            );
          }
        );
=======
        if (existingStarter) {
          // Update existing starter
          db.run(
            'UPDATE user_pokemon SET pokemon_id = ?, pokemon_name = ?, pokemon_data = ?, level = 5, experience = 0 WHERE user_id = ? AND is_starter = 1',
            [pokemon.id, pokemon.name, JSON.stringify(pokemon), userId],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Failed to update Pokemon' });
              }

              db.run(
                'UPDATE users SET chosen_pokemon_id = ? WHERE id = ?',
                [pokemon.id, userId],
                (err) => {
                  if (err) {
                    return res.status(500).json({ error: 'Failed to update user' });
                  }

                  res.json({ 
                    message: 'Starter Pokemon updated successfully',
                    pokemon 
                  });
                }
              );
            }
          );
        } else {
          // Insert new starter pokemon
          db.run(
            'INSERT INTO user_pokemon (user_id, pokemon_id, pokemon_name, pokemon_data, is_starter, level, experience) VALUES (?, ?, ?, ?, 1, 5, 0)',
            [userId, pokemon.id, pokemon.name, JSON.stringify(pokemon)],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Failed to save Pokemon' });
              }

              db.run(
                'UPDATE users SET chosen_pokemon_id = ? WHERE id = ?',
                [pokemon.id, userId],
                (err) => {
                  if (err) {
                    return res.status(500).json({ error: 'Failed to update user' });
                  }

                  res.json({ 
                    message: 'Starter Pokemon chosen successfully',
                    pokemon 
                  });
                }
              );
            }
          );
        }
>>>>>>> zchandro-branch
      }
    );
  });
});

// Get user dashboard data
app.get('/api/dashboard', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.get(
<<<<<<< HEAD
    `SELECT u.username, up.pokemon_name, up.pokemon_data 
     FROM users u 
     LEFT JOIN user_pokemon up ON u.chosen_pokemon_id = up.pokemon_id AND up.is_starter = 1
=======
    `SELECT u.username, u.trophies, u.coins, up.pokemon_name, up.pokemon_data, up.level, up.experience
     FROM users u 
     LEFT JOIN user_pokemon up ON u.id = up.user_id AND up.is_starter = 1
>>>>>>> zchandro-branch
     WHERE u.id = ?`,
    [userId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

<<<<<<< HEAD
      res.json({
        user: { username: row.username },
        starterPokemon: row.pokemon_data ? JSON.parse(row.pokemon_data) : null
=======
      if (!row) {
        return res.status(404).json({ error: 'User not found' });
      }

      const expForNextLevel = row.level ? getExpForLevel(row.level) : 100;

      res.json({
        user: { 
          username: row.username,
          trophies: row.trophies || 0,
          coins: row.coins || 100
        },
        starterPokemon: row.pokemon_data ? {
          ...JSON.parse(row.pokemon_data),
          level: row.level || 5,
          experience: row.experience || 0,
          expForNextLevel: expForNextLevel
        } : null
>>>>>>> zchandro-branch
      });
    }
  );
});

<<<<<<< HEAD
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
=======
// Get user's starter Pokemon for battle
app.get('/api/user-starter', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  db.get(
    `SELECT pokemon_data, level, experience FROM user_pokemon 
     WHERE user_id = ? AND is_starter = 1`,
    [userId],
    async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Starter Pokemon not found' });
      }

      const pokemonData = JSON.parse(row.pokemon_data);
      const level = row.level || 5;
      const experience = row.experience || 0;
      
      try {
        // Fetch complete Pokemon data from PokeAPI to get real moves
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonData.id}`);
        const fullPokemonData = await response.json();
        
        // Get real moves with power information
        const moves = await getRealMoves(fullPokemonData.moves);
        
        const battleReadyPokemon = {
          ...pokemonData,
          level: level,
          maxHp: 100 + (level * 5), // HP increases with level
          currentHp: 100 + (level * 5),
          experience: experience,
          expForNextLevel: getExpForLevel(level),
          moves: moves
        };

        res.json(battleReadyPokemon);
      } catch (error) {
        console.error('Failed to fetch Pokemon moves:', error);
        // Fallback to type-based moves if API fails
        const battleReadyPokemon = {
          ...pokemonData,
          level: level,
          maxHp: 100 + (level * 5),
          currentHp: 100 + (level * 5),
          experience: experience,
          expForNextLevel: getExpForLevel(level),
          moves: getTypeBasedMoves(pokemonData.types)
        };
        res.json(battleReadyPokemon);
      }
    }
  );
});

// Get random opponent Pokemon
app.get('/api/random-opponent', authenticateToken, async (req, res) => {
  try {
    const randomId = Math.floor(Math.random() * 151) + 1;
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
    const pokemonData = await response.json();
    
    // Calculate opponent level (1-15)
    const level = Math.floor(Math.random() * 15) + 1;
    
    // Get real moves for opponent
    const moves = await getRealMoves(pokemonData.moves);
    
    const opponentData = {
      id: pokemonData.id,
      name: pokemonData.name,
      sprites: pokemonData.sprites,
      types: pokemonData.types.map(typeInfo => typeInfo.type.name),
      stats: pokemonData.stats,
      level: level,
      maxHp: 100 + (level * 8),
      currentHp: 100 + (level * 8),
      moves: moves
    };

    res.json(opponentData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch opponent Pokemon' });
  }
});

// Process battle result and update rewards
app.post('/api/battle-result', authenticateToken, (req, res) => {
  const { result, opponentLevel, damageTaken, turns, opponentData } = req.body;
  const userId = req.user.userId;

  // Calculate rewards based on performance
  let baseTrophies = result === 'win' ? 10 : 0;
  let baseCoins = result === 'win' ? 50 : 10;

  // Bonus for easy wins (low damage taken and few turns)
  let bonusMultiplier = 1;
  if (result === 'win') {
    if (damageTaken < 30 && turns < 3) {
      bonusMultiplier = 2; // Easy win
    } else if (damageTaken < 50 && turns < 5) {
      bonusMultiplier = 1.5; // Moderate win
    }
    
    // Bonus for beating higher level opponents
    const levelBonus = Math.max(1, opponentLevel / 5);
    bonusMultiplier *= levelBonus;
  }

  const trophiesEarned = Math.floor(baseTrophies * bonusMultiplier);
  const coinsEarned = Math.floor(baseCoins * bonusMultiplier);

  db.serialize(() => {
    // First get user's current Pokemon data
    db.get(
      `SELECT up.id, up.level, up.experience 
       FROM user_pokemon up 
       WHERE up.user_id = ? AND up.is_starter = 1`,
      [userId],
      (err, pokemon) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!pokemon) {
          return res.status(404).json({ error: 'Pokemon not found' });
        }

        let newLevel = pokemon.level || 5;
        let newExperience = pokemon.experience || 0;
        let levelsGained = 0;
        let expGained = 0;

        // Calculate experience gain if won
        if (result === 'win') {
          expGained = calculateExpGained(opponentLevel, newLevel, result, bonusMultiplier);
          newExperience = newExperience + expGained;

          // Check for level ups
          let expForNextLevel = getExpForLevel(newLevel);
          while (newExperience >= expForNextLevel && newLevel < 100) {
            newExperience -= expForNextLevel;
            newLevel++;
            levelsGained++;
            expForNextLevel = getExpForLevel(newLevel);
          }
        }

        // Update user trophies, coins, and Pokemon experience/level
        db.run(
          'UPDATE users SET trophies = COALESCE(trophies, 0) + ?, coins = COALESCE(coins, 100) + ? WHERE id = ?',
          [trophiesEarned, coinsEarned, userId],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to update rewards' });
            }

            // Update Pokemon experience and level
            db.run(
              'UPDATE user_pokemon SET level = ?, experience = ? WHERE id = ?',
              [newLevel, newExperience, pokemon.id],
              function(err) {
                if (err) {
                  return res.status(500).json({ error: 'Failed to update Pokemon' });
                }

                // Get updated user stats
                db.get(
                  'SELECT trophies, coins FROM users WHERE id = ?',
                  [userId],
                  (err, updatedUser) => {
                    if (err) {
                      console.error('Failed to get updated user stats:', err);
                    }

                    // Record battle history
                    db.run(
                      'INSERT INTO user_battles (user_id, opponent_pokemon_data, result, trophies_earned, coins_earned) VALUES (?, ?, ?, ?, ?)',
                      [userId, JSON.stringify(opponentData), result, trophiesEarned, coinsEarned],
                      function(err) {
                        if (err) {
                          console.error('Failed to record battle:', err);
                        }

                        res.json({
                          message: result === 'win' ? 'Battle won!' : 'Battle lost',
                          trophiesEarned,
                          coinsEarned,
                          expGained,
                          levelsGained,
                          newLevel,
                          newExperience,
                          expForNextLevel: getExpForLevel(newLevel),
                          bonusMultiplier: bonusMultiplier.toFixed(1),
                          newTrophies: updatedUser?.trophies || 0,
                          newCoins: updatedUser?.coins || 100
                        });
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});

// Get user stats for dashboard
app.get('/api/user-stats', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.get(
    `SELECT COALESCE(trophies, 0) as trophies, COALESCE(coins, 100) as coins FROM users WHERE id = ?`,
    [userId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Get battle history count
      db.get(
        `SELECT COUNT(*) as totalBattles, 
                SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins 
         FROM user_battles WHERE user_id = ?`,
        [userId],
        (err, battleStats) => {
          if (err) {
            console.error('Failed to get battle stats:', err);
          }

          res.json({
            trophies: row.trophies,
            coins: row.coins,
            totalBattles: battleStats?.totalBattles || 0,
            wins: battleStats?.wins || 0
          });
        }
      );
    }
  );
});

// Reset user data (for testing)
app.post('/api/reset-data', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.serialize(() => {
    // Reset user stats
    db.run(
      'UPDATE users SET trophies = 0, coins = 100, chosen_pokemon_id = NULL WHERE id = ?',
      [userId]
    );

    // Delete user pokemon
    db.run(
      'DELETE FROM user_pokemon WHERE user_id = ?',
      [userId]
    );

    // Delete battle history
    db.run(
      'DELETE FROM user_battles WHERE user_id = ?',
      [userId]
    );

    res.json({ message: 'User data reset successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Get leaderboards (top users by trophies)
app.get('/api/leaderboards', authenticateToken, (req, res) => {
  db.all(
    `SELECT username, trophies, coins, 
            (SELECT COUNT(*) FROM user_battles ub WHERE ub.user_id = u.id) as totalBattles,
            (SELECT COUNT(*) FROM user_battles ub WHERE ub.user_id = u.id AND ub.result = 'win') as wins
     FROM users u 
     WHERE trophies > 0
     ORDER BY trophies DESC, wins DESC 
     LIMIT 50`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

// Get user's battle history
app.get('/api/battle-history', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  
  db.all(
    `SELECT id, opponent_pokemon_data, result, trophies_earned, coins_earned, battle_date
     FROM user_battles 
     WHERE user_id = ? 
     ORDER BY battle_date DESC 
     LIMIT 50`,
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const battles = rows.map(battle => ({
        id: battle.id,
        result: battle.result,
        trophiesEarned: battle.trophies_earned,
        coinsEarned: battle.coins_earned,
        date: battle.battle_date,
        opponent: JSON.parse(battle.opponent_pokemon_data)
      }));
      
      res.json(battles);
    }
  );
>>>>>>> zchandro-branch
});