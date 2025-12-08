// ←←← САМОЕ НАЧАЛО ФАЙЛА, ДО ВСЕГО!
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import { Buffer } from 'buffer'
import process from 'process'

window.Buffer = window.Buffer || Buffer
window.process = window.process || process
window.global = window.global || window

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TonConnectProvider } from './TonConnectProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TonConnectProvider>
      <App />
    </TonConnectProvider>
  </StrictMode>
)