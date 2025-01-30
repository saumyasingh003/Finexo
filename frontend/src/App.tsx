import { useState } from 'react'
import {BrowserRouter as Router, Routes , Route} from 'react-router-dom'
import './App.css'
import FileUploadPage from './pages/FileUploadPage.tsx'
function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="bg-gray-900 min-h-screen">
      <Router >
        <Routes>
          <Route path="/" element={<FileUploadPage />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
