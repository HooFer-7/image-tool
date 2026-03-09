import { useState, useEffect } from 'react'
import DropZone from '../components/DropZone'
import { compressImage, resizeByPixels, resizeByPercent, getImageDimensions } from '../utils/imageUtils'
import { Download, Loader2, Lock, Unlock, ImageIcon } from 'lucide-react'

const TABS = [
  { id: 'pixels',   label: 'By Pixels' },
  { id: 'compress', label: 'By File Size' },
  { id: 'percent',  label: 'By Percentage' },
]

const SIZE_RANGES = [
  { label: 'Max 500 KB', max: 0.5 },
  { label: 'Max 1 MB',   max: 1   },
  { label: '1 MB → 2 MB', max: 2  },
  { label: '2 MB → 5 MB', max: 5  },
]

const FORMATS = [
  { label: 'JPEG', value: 'image/jpeg', ext: 'jpg' },
  { label: 'PNG',  value: 'image/png',  ext: 'png' },
  { label: 'WebP', value: 'image/webp', ext: 'webp' },
]

const PRESETS = [
  { label: 'HD',        w: 1280, h: 720  },
  { label: 'Full HD',   w: 1920, h: 1080 },
  { label: '4K',        w: 3840, h: 2160 },
  { label: 'Square',    w: 1080, h: 1080 },
  { label: 'Instagram', w: 1080, h: 1350 },
  { label: 'Twitter',   w: 1200, h: 675  },
]

export default function ResizeTool() {
  const [file, setFile]                   = useState(null)
  const [activeTab, setActiveTab]         = useState('pixels')
  const [result, setResult]               = useState(null)
  const [loading, setLoading]             = useState(false)
  const [format, setFormat]               = useState(FORMATS[0])
  const [origW, setOrigW]                 = useState(0)
  const [origH, setOrigH]                 = useState(0)
  const [targetW, setTargetW]             = useState('')
  const [targetH, setTargetH]             = useState('')
  const [lockRatio, setLockRatio]         = useState(true)
  const [selectedRange, setSelectedRange] = useState(SIZE_RANGES[0])
  const [percent, setPercent]             = useState(50)
  const [quality, setQuality]             = useState(92)

  useEffect(() => {
    if (!file) return
    setResult(null)
    getImageDimensions(file).then(({ width, height }) => {
      setOrigW(width); setOrigH(height)
      setTargetW(String(width)); setTargetH(String(height))
    })
  }, [file])

  const handleWidthChange = (val) => {
    setTargetW(val)
    if (lockRatio && origW && origH)
      setTargetH(String(Math.round(Number(val) * (origH / origW))))
  }
  const handleHeightChange = (val) => {
    setTargetH(val)
    if (lockRatio && origW && origH)
      setTargetW(String(Math.round(Number(val) * (origW / origH))))
  }

  const handleProcess = async () => {
    if (!file) return
    setLoading(true)
    try {
      let out
      if (activeTab === 'pixels')
        out = await resizeByPixels(file, Number(targetW), Number(targetH), format.value, quality / 100)
      else if (activeTab === 'compress')
        out = await compressImage(file, selectedRange.max)
      else
        out = await resizeByPercent(file, percent, format.value, quality / 100)
      setResult({ ...out, ext: format.ext })
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const origSizeMB   = file ? (file.size / (1024 * 1024)).toFixed(2) : null
  const estimatedW   = origW ? Math.round(origW * (percent / 100)) : 0
  const estimatedH   = origH ? Math.round(origH * (percent / 100)) : 0

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col">
      {/* ── Page header ── */}
      <div className="px-8 pt-8 pb-4 border-b border-white/8">
        <h1 className="text-2xl font-black tracking-tighter">Resize & Compress</h1>
        <p className="text-white/40 text-sm mt-1">Resize by pixels, percentage, or compress to a target file size.</p>
      </div>

      {/* ── Split layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ════ LEFT PANEL — Controls ════ */}
        <div className="w-[420px] shrink-0 border-r border-white/8 overflow-y-auto px-6 py-6 space-y-7">

          {/* Upload */}
          <div>
            <SectionLabel text="Upload Image" />
            <DropZone onFile={(f) => { setFile(f); setResult(null) }} label="Drop image here" />
            {file && (
              <p className="text-xs text-white/40 mt-2">
                {file.name} &nbsp;·&nbsp; {origSizeMB} MB
                {origW > 0 && <> &nbsp;·&nbsp; {origW} × {origH} px</>}
              </p>
            )}
          </div>

          {/* Mode tabs */}
          <div>
            <SectionLabel text="Resize Mode" />
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
              {TABS.map((t) => (
                <button key={t.id}
                  onClick={() => { setActiveTab(t.id); setResult(null) }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200
                    ${activeTab === t.id ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── By Pixels ── */}
          {activeTab === 'pixels' && (
            <div className="space-y-5">
              {/* Presets */}
              <div>
                <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Quick Presets</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((p) => (
                    <button key={p.label}
                      onClick={() => { setTargetW(String(p.w)); setTargetH(String(p.h)); setLockRatio(false) }}
                      className="px-2.5 py-1 rounded-lg text-xs border border-white/15 text-white/50
                        hover:border-white/50 hover:text-white transition-all duration-200">
                      {p.label} <span className="text-white/25">{p.w}×{p.h}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* W / H */}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <p className="text-xs text-white/30 mb-1.5">Width (px)</p>
                  <input type="number" value={targetW}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5
                      text-white text-sm focus:outline-none focus:border-white/50 transition" />
                </div>
                <button onClick={() => setLockRatio(!lockRatio)}
                  className={`mb-0.5 p-2.5 rounded-xl border transition-all duration-200
                    ${lockRatio ? 'border-white bg-white text-black' : 'border-white/20 text-white/40 hover:text-white'}`}>
                  {lockRatio ? <Lock size={13} /> : <Unlock size={13} />}
                </button>
                <div className="flex-1">
                  <p className="text-xs text-white/30 mb-1.5">Height (px)</p>
                  <input type="number" value={targetH}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5
                      text-white text-sm focus:outline-none focus:border-white/50 transition" />
                </div>
              </div>
              {lockRatio && <p className="text-xs text-white/25 flex items-center gap-1"><Lock size={9} /> Aspect ratio locked</p>}
              <FormatQuality format={format} setFormat={setFormat} quality={quality} setQuality={setQuality} />
            </div>
          )}

          {/* ── By File Size ── */}
          {activeTab === 'compress' && (
            <div className="space-y-3">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Target Size</p>
              {SIZE_RANGES.map((r) => (
                <button key={r.label} onClick={() => setSelectedRange(r)}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-medium border text-left transition-all duration-200
                    ${selectedRange.label === r.label
                      ? 'bg-white text-black border-white'
                      : 'border-white/20 text-white/60 hover:border-white/50 hover:text-white'}`}>
                  {r.label}
                </button>
              ))}
              <p className="text-xs text-white/25 pt-1">Output is always JPEG for best compression.</p>
            </div>
          )}

          {/* ── By Percentage ── */}
          {activeTab === 'percent' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-white/30 uppercase tracking-widest">Scale</p>
                  <span className="text-xl font-black">{percent}%</span>
                </div>
                <input type="range" min={5} max={200} step={5} value={percent}
                  onChange={(e) => setPercent(Number(e.target.value))}
                  className="w-full accent-white" />
                <div className="flex justify-between text-xs text-white/20 mt-1"><span>5%</span><span>100%</span><span>200%</span></div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[25, 50, 75, 100, 150, 200].map((p) => (
                  <button key={p} onClick={() => setPercent(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-200
                      ${percent === p ? 'bg-white text-black border-white' : 'border-white/20 text-white/50 hover:text-white hover:border-white/50'}`}>
                    {p}%
                  </button>
                ))}
              </div>
              {origW > 0 && (
                <p className="text-xs text-white/40">
                  Output: <span className="text-white">{estimatedW} × {estimatedH} px</span>
                </p>
              )}
              <FormatQuality format={format} setFormat={setFormat} quality={quality} setQuality={setQuality} />
            </div>
          )}

          {/* Process button */}
          <button onClick={handleProcess} disabled={!file || loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-white text-black
              hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200
              flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Processing...</> : 'Apply'}
          </button>
        </div>

        {/* ════ RIGHT PANEL — Output ════ */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-10 bg-white/[0.02]">
          {!result && !file && <EmptyState icon={<ImageIcon size={32} />} text="Upload an image to get started" />}
          {!result && file  && <EmptyState icon={<ImageIcon size={32} />} text="Configure settings and click Apply" />}
          {result && (
            <div className="w-full max-w-xl space-y-5">
              <img src={result.url} alt="Output"
                className="w-full rounded-2xl object-contain max-h-[55vh] bg-white/5 border border-white/10" />

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="Original" value={`${origSizeMB} MB`} sub={`${origW} × ${origH}`} />
                <StatCard label="Output"   value={`${result.sizeMB} MB`} sub={result.width ? `${result.width} × ${result.height}` : '—'} />
                <StatCard label="Saved"
                  value={`${Math.max(0, Math.round((1 - result.sizeMB / origSizeMB) * 100))}%`}
                  sub="reduction" />
              </div>

              <a href={result.url} download={`resized.${result.ext || 'jpg'}`}
                className="flex items-center justify-center gap-2 w-full bg-white text-black
                  py-3.5 rounded-xl font-bold text-sm hover:bg-white/90 transition-colors">
                <Download size={15} /> Download
              </a>
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
      {icon}
      <p className="text-sm">{text}</p>
    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
      <p className="text-xs text-white/30 mb-1">{label}</p>
      <p className="text-lg font-black">{value}</p>
      <p className="text-xs text-white/30 mt-0.5">{sub}</p>
    </div>
  )
}

function FormatQuality({ format, setFormat, quality, setQuality }) {
  const fmts = [
    { label: 'JPEG', value: 'image/jpeg', ext: 'jpg' },
    { label: 'PNG',  value: 'image/png',  ext: 'png' },
    { label: 'WebP', value: 'image/webp', ext: 'webp' },
  ]
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Format</p>
        <div className="flex gap-2">
          {fmts.map((f) => (
            <button key={f.label} onClick={() => setFormat(f)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all duration-200
                ${format.value === f.value ? 'bg-white text-black border-white' : 'border-white/20 text-white/50 hover:text-white hover:border-white/50'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-2">
          <p className="text-xs text-white/30 uppercase tracking-widest">Quality</p>
          <span className="text-xs font-bold">{quality}%</span>
        </div>
        <input type="range" min={10} max={100} step={1} value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="w-full accent-white" />
        <div className="flex justify-between text-xs text-white/20 mt-1">
          <span>Smaller</span><span>Best</span>
        </div>
      </div>
    </div>
  )
}