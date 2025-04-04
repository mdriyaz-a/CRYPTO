import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth-context'

// Layout
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// Pages
import HomePage from '@/pages/HomePage'
import ClassicalCiphersPage from '@/pages/ClassicalCiphersPage'
import ModernCiphersPage from '@/pages/ModernCiphersPage'
import MessageIntegrityPage from '@/pages/MessageIntegrityPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Individual Cipher Pages
import CaesarCipherPage from '@/pages/ciphers/classical/CaesarCipherPage'
import SubstitutionCipherPage from '@/pages/ciphers/classical/SubstitutionCipherPage'
import VigenereCipherPage from '@/pages/ciphers/classical/VigenereCipherPage'
import AESPage from '@/pages/ciphers/modern/AESPage'
import TripleDESPage from '@/pages/ciphers/modern/TripleDESPage'

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import AccountPageNew from '@/pages/auth/AccountPageNew'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Main Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />

          {/* Classical Ciphers */}
          <Route path="classical" element={<ClassicalCiphersPage />} />
          <Route path="classical/caesar" element={<CaesarCipherPage />} />
          <Route path="classical/substitution" element={<SubstitutionCipherPage />} />
          <Route path="classical/vigenere" element={<VigenereCipherPage />} />

          {/* Modern Ciphers */}
          <Route path="modern" element={<ModernCiphersPage />} />
          <Route path="modern/aes" element={<AESPage />} />
          <Route path="modern/3des" element={<TripleDESPage />} />

          {/* Message Integrity */}
          <Route path="integrity" element={<MessageIntegrityPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="account" element={<AccountPageNew />} />
          </Route>

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App