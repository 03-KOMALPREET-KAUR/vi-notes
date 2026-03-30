import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Login from './components/Login'
import Editor from './components/Editor'
import SessionHistory from './pages/SessionHistory'
import SessionDetails from './pages/SessionDetails'

const AppContent: React.FC = () => {
  const { user } = useAuth()

  return (
    <Routes>
      {!user ? (
        <Route path="*" element={<Login />} />
      ) : (
        <>
          <Route path="/" element={<Editor />} />
          <Route path="/sessions" element={<SessionHistory />} />
          <Route path="/sessions/:id" element={<SessionDetails />} />
        </>
      )}
    </Routes>
  )
}

const App: React.FC = () => (
<ThemeProvider>
  <AuthProvider>
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </AuthProvider>
</ThemeProvider>
)

export default App