import React, { useState } from 'react'
import { loginUser, registerUser } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

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
      <div style={s.topBar}>
        <ThemeToggle />
      </div>
      <div style={s.card}>
        <h1 style={s.logo}>Vi-Notes</h1>
        <p style={s.tagline}>Authenticity verification for human writing</p>
        <h2 style={s.heading}>{isRegister ? 'Create account' : 'Sign in'}</h2>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={s.form}>
          {isRegister && (
            <input style={s.input} name="username" placeholder="Username"
              value={form.username} onChange={handleChange} required />
          )}
          <input style={s.input} name="email" type="email" placeholder="Email"
            value={form.email} onChange={handleChange} required />
          <input style={s.input} name="password" type="password" placeholder="Password"
            value={form.password} onChange={handleChange} required />
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        <p style={s.switchText}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <span style={s.switchLink}
            onClick={() => { setIsRegister(!isRegister); setError('') }}>
            {isRegister ? 'Sign in' : 'Register'}
          </span>
        </p>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-page)',
    position: 'relative',
  },
  topBar: {
    position: 'absolute',
    top: 20,
    right: 24,
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '44px 40px',
    width: '100%',
    maxWidth: 420,
    boxShadow: 'var(--shadow)',
  },
  logo: {
    color: 'var(--text-primary)',
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: '-0.5px',
  },
  tagline: {
    color: 'var(--text-secondary)',
    fontSize: 13,
    margin: '6px 0 32px',
  },
  heading: {
    color: 'var(--text-primary)',
    fontSize: 17,
    fontWeight: 500,
    marginBottom: 18,
  },
  error: {
    background: 'var(--error-bg)',
    border: '1px solid var(--error-border)',
    color: 'var(--error-text)',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    marginBottom: 14,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 11 },
  input: {
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '11px 14px',
    color: 'var(--text-primary)',
    fontSize: 14,
    outline: 'none',
  },
  btn: {
    background: 'var(--accent)',
    color: 'var(--accent-text)',
    border: 'none',
    borderRadius: 8,
    padding: '12px',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: 6,
  },
  switchText: {
    color: 'var(--text-secondary)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 22,
  },
  switchLink: { color: 'var(--accent)', cursor: 'pointer' },
}

export default Login