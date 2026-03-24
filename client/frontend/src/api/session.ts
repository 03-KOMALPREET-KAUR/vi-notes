import axios from 'axios'

export const saveSession = async (sessionData: object, token: string) => {
  const { data } = await axios.post('/api/sessions/save', sessionData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

export const getMySessions = async (token: string) => {
  const { data } = await axios.get('/api/sessions/my', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}