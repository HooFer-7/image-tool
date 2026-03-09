import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'

/**
 * Reusable file drop zone component.
 * Props:
 *   onFile(file) — called when user drops/selects a file
 *   label — optional custom label text
 */
export default function DropZone({ onFile, label = "Drop an image here" }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFile(acceptedFiles[0]) // Pass the first file to parent
    }
  }, [onFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] }, // Only accept image files
    multiple: false,           // One file at a time
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
        ${isDragActive
          ? 'border-white bg-white/10'     // Highlight when dragging over
          : 'border-white/20 hover:border-white/50 hover:bg-white/5'
        }`}
    >
      <input {...getInputProps()} />
      <Upload size={32} className="mx-auto mb-4 text-white/40" />
      <p className="text-white/60 text-sm">
        {isDragActive ? 'Release to upload' : label}
      </p>
      <p className="text-white/30 text-xs mt-2">or click to browse files</p>
    </div>
  )
}