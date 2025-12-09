import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TonConnectProvider } from './TonConnectProvider.jsx'

const rootElement = document.getElementById('root')
const root = createRoot(rootElement)

root.render(
  <StrictMode>
    <TonConnectProvider>
      <App />
    </TonConnectProvider>
  </StrictMode>
)