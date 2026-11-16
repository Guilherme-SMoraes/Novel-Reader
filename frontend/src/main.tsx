import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './context/ToastContext'
import { ModalDockProvider } from './context/ModalDockContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <ModalDockProvider>
        <App />
      </ModalDockProvider>
    </ToastProvider>
  </StrictMode>,
)
