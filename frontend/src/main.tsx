import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastProvider } from './context/ToastContext'
import { ModalDockProvider } from './context/ModalDockContext'
import { AuthProvider } from './context/AuthContext'
import { GoogleOAuthProvider } from '@react-oauth/google'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'placeholder.apps.googleusercontent.com';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={googleClientId}>
        <ToastProvider>
          <AuthProvider>
            <ModalDockProvider>
              <App />
            </ModalDockProvider>
          </AuthProvider>
        </ToastProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
