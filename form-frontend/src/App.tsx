import { useState, useEffect } from 'react'
import Form from './components/Form'
import './App.css'

// Conditionally load mobile CSS
if (window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  import('./App.mobile.css')
  import('./components/Form.mobile.css')
  import('./components/ProductGrid.mobile.css')
  import('./components/OrderManager.mobile.css')
  import('./components/InventoryManager.mobile.css')
}

function App() {
  return (
    <div className="App">
      <Form />
    </div>
  )
}

export default App

