import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ResizeTool from './pages/ResizeTool'
import CropTool from './pages/CropTool'
import GridTool from './pages/GridTool'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resize" element={<ResizeTool />} />
          <Route path="/crop" element={<CropTool />} />
          <Route path="/grid" element={<GridTool />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App