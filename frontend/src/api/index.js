const API_BASE = '/api';

export const authAPI = {
  register: (data) => fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  
  login: (data) => fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  
  me: () => fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }).then(res => res.json())
};

export const trialAPI = {
  generate: (data) => fetch(`${API_BASE}/trial/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  
  getStatus: (taskId) => fetch(`${API_BASE}/trial/status/${taskId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }).then(res => res.json())
};
