import { useState } from 'react'
import DropZone from '../components/DropZone'
import { gridCutImage } from '../utils/imageUtils'
import { Download, Loader2, Grid3X3 } from 'lucide-react'

export default function GridTool() {
  const [file, setFile]         = useState(null)
  const [direction, setDirection] = useState('vertical')
  const [pieces, setPieces]     = useState(3)
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [preview, setPreview]   = useState(null) // original image preview URL

  const handleFile = (f) => {
    setFile(f)
    setResults([])
    setPreview(URL.createObjectURL(f))
  }

  const handleCut = async () => {
    if (!file) return
    setLoading(true)
    const slices = await gridCutImage(file, direction, pieces)
    setResults(slices)
    setLoading(false)
  }

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-white/8">
        <h1 className="text-2xl font-black tracking-tighter">Grid Cutter</h1>
        <p className="text-white/40 text-sm mt-1">Slice an image into equal pieces — perfect for social media grids.</p>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ════ LEFT — Controls ════ */}
        <div className="w-[420px] shrink-0 border-r border-white/8 overflow-y-auto px-6 py-6 space-y-7">

          {/* Upload */}
          <div>
            <SectionLabel text="Upload Image" />
            <DropZone onFile={handleFile} />
            {file && <p className="text-xs text-white/40 mt-2">✓ {file.name}</p>}
          </div>

          {/* Direction */}
          <div>
            <SectionLabel text="Cut Direction" />
            <div className="flex gap-2">
              {['vertical', 'horizontal'].map((d) => (
                <button key={d} onClick={() => setDirection(d)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium border capitalize transition-all duration-200
                    ${direction === d
                      ? 'bg-white text-black border-white'
                      : 'border-white/20 text-white/60 hover:border-white/50 hover:text-white'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Pieces */}
          <div>
            <SectionLabel text="Number of Pieces" />
            <div className="flex items-center gap-4">
              <button onClick={() => setPieces(Math.max(2, pieces - 1))}
                className="w-10 h-10 rounded-xl border border-white/20 text-white hover:bg-white/10 transition text-xl font-bold flex items-center justify-center">
                −
              </button>
              <span className="text-4xl font-black w-12 text-center">{pieces}</span>
              <button onClick={() => setPieces(Math.min(10, pieces + 1))}
                className="w-10 h-10 rounded-xl border border-white/20 text-white hover:bg-white/10 transition text-xl font-bold flex items-center justify-center">
                +
              </button>
            </div>
            <p className="text-xs text-white/25 mt-2">Maximum 10 pieces</p>
          </div>

          {/* Visual hint */}
          {file && (
            <div>
              <SectionLabel text="Preview Split" />
              <div className={`w-full h-20 bg-white/5 border border-white/10 rounded-xl overflow-hidden
                flex ${direction === 'vertical' ? 'flex-row' : 'flex-col'} gap-px`}>
                {Array.from({ length: pieces }).map((_, i) => (
                  <div key={i} className="flex-1 border border-white/10 flex items-center justify-center">
                    <span className="text-white/20 text-xs font-bold">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cut button */}
          <button onClick={handleCut} disabled={!file || loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-white text-black
              hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200
              flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Cutting...</> : 'Cut Image'}
          </button>

          {/* Download all */}
          {results.length > 0 && (
            <button
              onClick={() => results.forEach((s) => {
                const a = document.createElement('a')
                a.href = s.url; a.download = `piece-${s.index}.png`; a.click()
              })}
              className="w-full py-3 rounded-xl text-sm font-semibold border border-white/20
                text-white/60 hover:text-white hover:border-white/50 transition flex items-center justify-center gap-2">
              <Download size={14} /> Download All ({results.length})
            </button>
          )}
        </div>

        {/* ════ RIGHT — Output ════ */}
        <div className="flex-1 overflow-y-auto p-8 bg-white/[0.02]">

          {/* Empty */}
          {!file && (
            <div className="h-full flex items-center justify-center">
              <EmptyState icon={<Grid3X3 size={32} />} text="Upload an image to get started" />
            </div>
          )}

          {/* Original preview before cutting */}
          {file && results.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <img src={preview} alt="Preview"
                className="max-w-full max-h-[60vh] rounded-2xl object-contain border border-white/10 bg-white/5" />
              <p className="text-xs text-white/30">Configure settings and click Cut Image</p>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-5">
                {results.length} pieces · {direction}
              </p>
              <div className={`grid gap-4 ${direction === 'vertical'
                ? 'grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 max-w-lg mx-auto'}`}>
                {results.map((slice) => (
                  <div key={slice.index}
                    className="border border-white/10 rounded-2xl overflow-hidden bg-white/5
                      hover:border-white/25 transition-all duration-200 group">
                    <img src={slice.url} alt={`Piece ${slice.index}`} className="w-full object-cover" />
                    <div className="px-3 py-2.5 flex items-center justify-between">
                      <span className="text-xs text-white/30 font-medium">#{slice.index}</span>
                      <a href={slice.url} download={`piece-${slice.index}.png`}
                        className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20
                          px-3 py-1.5 rounded-lg transition text-white">
                        <Download size={10} /> Save
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ text }) {
  return <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">{text}</p>
}
function EmptyState({ icon, text }) {
  return (
    <div className="flex flex-col items-center gap-4 text-white/20 select-none">
      {icon}<p className="text-sm">{text}</p>
    </div>
  )
}