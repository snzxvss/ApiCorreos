import axios from 'axios';

const AUTH_API_URL = 'http://localhost:3000/authenticate';

export const authenticateUser = async (authCode) => {
  try {
    const response = await axios.post(AUTH_API_URL, authCode);
    if (response.data && response.data.attemptsLeft !== undefined) {
      localStorage.setItem('token', JSON.stringify(authCode.authCode));
      return response.data;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw error;
  }
};