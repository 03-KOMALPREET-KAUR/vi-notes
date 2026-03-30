import React from 'react'
import { useTheme } from '../context/ThemeContext'

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        background: 'var(--toggle-bg)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 10px',
        transition: 'all 0.2s',
      }}
    >
      <span style={{ fontSize: 14 }}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
      <span style={{
        fontSize: 11,
        fontWeight: 500,
        color: 'var(--text-secondary)',
        fontFamily: 'inherit',
      }}>
        {theme === 'dark' ? 'Light' : 'Dark'}
      </span>
    </button>
  )
}

export default ThemeToggle