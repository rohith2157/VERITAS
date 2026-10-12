import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { setupApiInterceptor } from './config/api'
import App from './App.jsx'

// Install transparent microservice router interceptor
setupApiInterceptor();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
