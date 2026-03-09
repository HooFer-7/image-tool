import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import DropZone from '../components/DropZone'
import { getCroppedImage } from '../utils/imageUtils'
import { Download, Crop } from 'lucide-react'

const RATIOS = [
  { label: 'Custom', value: null },
  { label: '1:1',    value: 1 / 1 },
  { label: '16:9',   value: 16 / 9 },
  { label: '9:16',   value: 9 / 16 },
  { label: '4:3',    value: 4 / 3 },
  { label: '3:4',    value: 3 / 4 },
]

export default function CropTool() {
  const [imageSrc, setImageSrc]               = useState(null)
  const [selectedRatio, setSelectedRatio]     = useState(RATIOS[0])
  const [crop, setCrop]                       = useState({ x: 0, y: 0 })
  const [zoom, setZoom]                       = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [croppedUrl, setCroppedUrl]           = useState(null)

  const handleFile = (file) => {
    const reader = new FileReader()
    reader.onload = () => { setImageSrc(reader.result); setCroppedUrl(null) }
    reader.readAsDataURL(file)
  }

  const onCropComplete = useCallback((_, pixels) => setCroppedAreaPixels(pixels), [])

  const handleCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    const url = await getCroppedImage(imageSrc, croppedAreaPixels)
    setCroppedUrl(url)
  }

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-white/8">
        <h1 className="text-2xl font-black tracking-tighter">Image Cropper</h1>
        <p className="text-white/40 text-sm mt-1">Crop with preset or custom aspect ratios.</p>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ════ LEFT — Controls ════ */}
        <div className="w-[420px] shrink-0 border-r border-white/8 overflow-y-auto px-6 py-6 space-y-7">

          {/* Upload */}
          <div>
            <SectionLabel text="Upload Image" />
            {!imageSrc
              ? <DropZone onFile={handleFile} />
              : (
                <button onClick={() => { setImageSrc(null); setCroppedUrl(null) }}
                  className="w-full py-2.5 rounded-xl text-sm text-white/40 hover:text-white
                    border border-white/10 hover:border-white/30 transition">
                  ↑ Upload different image
                </button>
              )
            }
          </div>

          {/* Aspect ratio */}
          <div>
            <SectionLabel text="Aspect Ratio" />
            <div className="grid grid-cols-3 gap-2">
              {RATIOS.map((r) => (
                <button key={r.label} onClick={() => setSelectedRatio(r)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all duration-200
                    ${selectedRatio.label === r.label
                      ? 'bg-white text-black border-white'
                      : 'border-white/20 text-white/60 hover:border-white/50 hover:text-white'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom */}
          {imageSrc && (
            <div>
              <div className="flex justify-between mb-2">
                <SectionLabel text="Zoom" />
                <span className="text-xs font-bold text-white/60">{zoom.toFixed(1)}×</span>
              </div>
              <input type="range" min={1} max={3} step={0.01} value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-white" />
              <div className="flex justify-between text-xs text-white/20 mt-1">
                <span>1×</span><span>3×</span>
              </div>
            </div>
          )}

          {/* Crop button */}
          <button onClick={handleCrop} disabled={!imageSrc}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-white text-black
              hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200
              flex items-center justify-center gap-2">
            <Crop size={14} /> Apply Crop
          </button>

          {croppedUrl && (
            <a href={croppedUrl} download="cropped.png"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm
                border border-white/20 text-white hover:bg-white/10 transition">
              <Download size={14} /> Download Result
            </a>
          )}
        </div>

        {/* ════ RIGHT — Output ════ */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white/[0.02]">

          {!imageSrc && (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState icon={<Crop size={32} />} text="Upload an image to start cropping" />
            </div>
          )}

          {imageSrc && !croppedUrl && (
            /* Live crop preview fills the right panel */
            <div className="flex-1 relative">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={selectedRatio.value}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                style={{
                  containerStyle: { background: '#0a0a0a', width: '100%', height: '100%' },
                  cropAreaStyle: { border: '2px solid white', borderRadius: '4px' },
                  mediaStyle: {},
                }}
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm
                border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/50 pointer-events-none">
                Drag to reposition · Scroll or use slider to zoom
              </div>
            </div>
          )}

          {croppedUrl && (
            <div className="flex-1 flex flex-col items-center justify-center p-10 space-y-5">
              <img src={croppedUrl} alt="Cropped"
                className="max-w-full max-h-[60vh] rounded-2xl object-contain border border-white/10 bg-white/5" />
              <p className="text-xs text-white/30">Click "Download Result" in the left panel to save</p>
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