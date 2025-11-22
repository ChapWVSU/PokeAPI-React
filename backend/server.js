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

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
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
      'SELECT chosen_pokemon_id FROM users WHERE id = ?',
      [userId],
      (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

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
      }
    );
  });
});

// Get user dashboard data
app.get('/api/dashboard', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.get(
    `SELECT u.username, up.pokemon_name, up.pokemon_data 
     FROM users u 
     LEFT JOIN user_pokemon up ON u.chosen_pokemon_id = up.pokemon_id AND up.is_starter = 1
     WHERE u.id = ?`,
    [userId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        user: { username: row.username },
        starterPokemon: row.pokemon_data ? JSON.parse(row.pokemon_data) : null
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});