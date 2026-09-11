import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LocaleProvider } from './i18n/LocaleProvider'
import { PrefsProvider } from './app/PrefsProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider>
      <PrefsProvider>
        <App />
      </PrefsProvider>
    </LocaleProvider>
  </StrictMode>,
)
