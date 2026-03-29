import React, { useState } from 'react'
import { loginUser, registerUser } from '../api/auth'
import { useAuth } from '../context/AuthContext'

const Login: React.FC = () => {
  const { login } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = isRegister
        ? await registerUser(form.username, form.email, form.password)
        : await loginUser(form.email, form.password)
      login(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.logo}>Vi-Notes</h1>
        <p style={s.tagline}>Authenticity verification for human writing</p>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={s.form}>
          {isRegister && (
            <div>
              <label style={s.label}>Username</label>
              <input style={s.input} name="username" placeholder="Username"
              value={form.username} onChange={handleChange} required />
            </div>
          )}
          <div>
            <label style={s.label}>Email</label>
            <input style={s.input} name="email" type="email" placeholder="Email"
            value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <label style={s.label}>Password</label>
            <input style={s.input} name="password" type="password" placeholder="Password"
              value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        <p style={s.switchText}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <span style={s.switchLink} onClick={() => { setIsRegister(!isRegister); setError('') }}>
            {isRegister ? 'Sign in' : 'Register'}
          </span>
        </p>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f' },
  card: { background: '#161616', border: '1px solid #222', borderRadius: 14, padding: '44px 40px', width: '100%', maxWidth: 420 },
  logo: { color: '#fff', fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' },
  tagline: { color: '#555', fontSize: 13, margin: '6px 0 32px' },
  heading: { color: '#e5e5e5', fontSize: 17, fontWeight: 500, marginBottom: 18 },
  error: { background: '#1f1010', border: '1px solid #3f1515', color: '#f87171', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 11 },
  input: { background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: 8, padding: '11px 14px', color: '#e5e5e5', fontSize: 14, outline: 'none', transition: 'border-color .2s' },
  btn: { background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontSize: 14, fontWeight: 500, cursor: 'pointer', marginTop: 6 },
  switchText: { color: '#555', fontSize: 13, textAlign: 'center', marginTop: 22 },
  switchLink: { color: '#a78bfa', cursor: 'pointer' },
  label: {display: 'block', marginBottom: '4px', color: '#f0e7e7',fontSize: '12px'
}
}

export default Login