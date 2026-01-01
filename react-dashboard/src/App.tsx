import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import './App.css'

// Conditionally load mobile CSS
if (window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  import('./App.mobile.css')
  import('./components/Dashboard.mobile.css')
  import('./components/KPICards.mobile.css')
  import('./components/AlertsPanel.mobile.css')
  import('./components/InventoryStatus.mobile.css')
}

function App() {
  return (
    <div className="App">
      <Dashboard />
    </div>
  )
}

export default App

