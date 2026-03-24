import axios from 'axios'

export const registerUser = async (username: string, email: string, password: string) => {
  const { data } = await axios.post('/api/auth/register', { username, email, password })
  return data
}

export const loginUser = async (email: string, password: string) => {
  const { data } = await axios.post('/api/auth/login', { email, password })
  return data
}