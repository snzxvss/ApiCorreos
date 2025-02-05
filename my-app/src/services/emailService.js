import axios from 'axios';

const API_URL = 'http://localhost:3000/send-email';

export const sendEmail = async (emailData) => {
  try {
    const authCode = JSON.parse(localStorage.getItem('token'));
    const data = {
      ...emailData,
      authCode
    };
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};