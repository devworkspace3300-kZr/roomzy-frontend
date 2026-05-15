import api from './axios';

// POST /auth/register
// dto: { fullName, email, phone, password, role, gender?, city? }
export const registerUser = async (formData) => {
  const response = await api.post('/auth/register', formData);
  return response.data;  // { success: true, data: { token, user } }
};

// POST /auth/login
// dto: { email, password }
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    // The server already wraps response in { success, data, ... }
    return response.data;
  } catch (err) {
    // Propagate error so Login.jsx can handle it
    throw err;
  }
};

// GET /auth/me — requires token (added automatically by interceptor)
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;  // { success: true, data: { id, fullName, email, role... } }
};
