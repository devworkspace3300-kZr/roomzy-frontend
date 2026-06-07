import api from './axios';

/** Normalize login/register payloads from wrapped or direct API responses. */
export function normalizeAuthResponse(result) {
  if (!result) return null;

  if (result.success && result.data?.token && result.data?.user) {
    return { token: result.data.token, user: result.data.user };
  }

  if (result.token && result.user) {
    return { token: result.token, user: result.user };
  }

  return null;
}

// POST /auth/register
// dto: { fullName, email, phone, password, role, gender?, city? }
export const registerUser = async (formData) => {
  const response = await api.post('/auth/register', formData);
  return response.data;  // { success: true, data: { token, user } }
};

// POST /auth/login
// dto: { email, password }
export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

// GET /auth/me — requires token (added automatically by interceptor)
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;  // { success: true, data: { id, fullName, email, role... } }
};
