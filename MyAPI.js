import axios from 'axios';
import {API_BASE_URL} from './APIUrl'
// const API_BASE_URL = 'https://mynewapi-9ghe.onrender.com'; // Change this to your API's base URL

export const signup = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/signup`, {
      username,
      email,
      password
    });
    return response.data; // Assuming the API returns data as a response
  } catch (error) {
    console.error('Signup Error:', error.response);
    throw error;
  }
}

export const signin = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/signin`, {
      email,
      password
    });
    return response.data; // Assuming the API returns data as a response
  } catch (error) {
    console.error('Signin Error:', error.response);
    throw error;
  }
}


