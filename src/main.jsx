// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';

// export const server = "http://localhost:5000";
export const server = import.meta.env.VITE_SERVER;

createRoot(document.getElementById('root')).render(
  
    <AppProvider> 
      <App />
    </AppProvider>
   
    
)
