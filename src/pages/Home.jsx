import { Link } from 'react-router-dom'
import { ImageIcon, Crop, Grid3X3, ArrowRight } from 'lucide-react'

export default function Home() {
  const tools = [
    {
      path: '/resize',
      icon: <ImageIcon size={28} />,
      title: 'Resize & Compress',
      description: 'Reduce file size while maintaining quality. Choose target size ranges from 1MB to 5MB.',
    },
    {
      path: '/crop',
      icon: <Crop size={28} />,
      title: 'Image Cropper',
      description: 'Crop with precision. Supports 1:1, 16:9, 9:16, 4:3, 3:4, and custom ratios.',
    },
    {
      path: '/grid',
      icon: <Grid3X3 size={28} />,
      title: 'Grid Cutter',
      description: 'Slice images into equal vertical or horizontal pieces. Perfect for social media grids.',
    },
    
  ]

  return (
    <main className="max-w-6xl mx-auto px-6 py-20">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <h1 className="text-6xl font-black tracking-tighter mb-6 leading-none">
          Image Tools<br />
          <span className="text-white/30">Made Simple.</span>
        </h1>
        <p className="text-white/50 text-lg max-w-md mx-auto">
          Professional image processing — right in your browser. No uploads to servers. Your images stay private.
        </p>
      </div>

      {/* Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            className="group border border-white/10 rounded-2xl p-8 hover:border-white/30 hover:bg-white/5 transition-all duration-300"
          >
            <div className="text-white/40 group-hover:text-white transition-colors duration-300 mb-6">
              {tool.icon}
            </div>
            <h2 className="text-xl font-bold mb-3">{tool.title}</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-6">{tool.description}</p>
            <div className="flex items-center gap-2 text-sm text-white/30 group-hover:text-white transition-colors duration-300">
              <span>Open tool</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}