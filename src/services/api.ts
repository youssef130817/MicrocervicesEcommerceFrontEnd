import axios from 'axios';

const API_BASE_URL = 'http://localhost:5188/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
