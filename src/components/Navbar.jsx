import { Link, useLocation } from 'react-router-dom'
import { ImageIcon, Scissors, Grid3X3, Crop } from 'lucide-react'

// This is the navigation bar at the top of every page
export default function Navbar() {
  const location = useLocation() // tells us which page we're on

  // Helper: returns extra styles when a link is active (current page)
  const isActive = (path) => location.pathname === path

  return (
    <nav className="border-b border-white/10 px-6 py-4 backdrop-blur-sm sticky top-0 z-50 bg-black/80">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <ImageIcon size={22} />
          <span>PixelKit 1080</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          <NavLink to="/resize" icon={<ImageIcon size={15} />} label="Resize" active={isActive('/resize')} />
          <NavLink to="/crop" icon={<Crop size={15} />} label="Crop" active={isActive('/crop')} />
          <NavLink to="/grid" icon={<Grid3X3 size={15} />} label="Grid Cut" active={isActive('/grid')} />
        </div>
      </div>
    </nav>
  )
}

// A single nav link — reusable component
function NavLink({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${active
          ? 'bg-white text-black'           // Active: white background, black text
          : 'text-white/60 hover:text-white hover:bg-white/10'  // Inactive: subtle
        }`}
    >
      {icon}
      {label}
    </Link>
  )
}