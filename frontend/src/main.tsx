import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import './styles/global.css'



// Mount app
const root = document.getElementById('root')

if (root) {
    createRoot(root).render(
        <StrictMode>
            <App />
        </StrictMode>
    )
}
