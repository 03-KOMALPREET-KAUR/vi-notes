import axios from 'axios'

const API = import.meta.env.VITE_API_URL;

export const registerUser = async (username: string, email: string, password: string) => {
  const { data } = await axios.post(`${API}/api/auth/register`, { username, email, password })
  return data
}

export const loginUser = async (email: string, password: string) => {
  const { data } = await axios.post(`${API}/api/auth/login`, { email, password })
  return data
}