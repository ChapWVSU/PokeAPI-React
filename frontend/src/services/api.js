import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (username, password) => 
    api.post('/login', { username, password }).then(res => res.data),
  
  register: (username, email, password) => 
    api.post('/register', { username, email, password }).then(res => res.data),
  
  verifyToken: () => 
    api.get('/dashboard').then(res => res.data.user),
};

export const pokemonAPI = {
  getRandomPokemon: () => 
    api.get('/random-pokemon').then(res => res.data),
  
  chooseStarter: (pokemon) => 
    api.post('/choose-starter', { pokemon }).then(res => res.data),
  
  getDashboardData: () => 
    api.get('/dashboard').then(res => res.data),
  
  getRandomOpponent: () => 
    api.get('/random-opponent').then(res => res.data),
  
  getUserStarter: () => 
    api.get('/user-starter').then(res => res.data),
  
  submitBattleResult: (battleData) => 
    api.post('/battle-result', battleData).then(res => res.data),
  
  getUserStats: () => 
    api.get('/user-stats').then(res => res.data),
  
  getLeaderboards: () => 
    api.get('/leaderboards').then(res => res.data),
  
  getBattleHistory: () => 
    api.get('/battle-history').then(res => res.data),
};