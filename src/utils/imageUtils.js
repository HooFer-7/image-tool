// ─── RESIZE / COMPRESS TOOL ───────────────────────────────────────────

export async function compressImage(file, targetMaxMB) {
  return new Promise((resolve) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        let quality = 0.9
        const targetBytes = targetMaxMB * 1024 * 1024
        const tryCompress = () => {
          canvas.toBlob((blob) => {
            if (blob.size <= targetBytes || quality <= 0.1) {
              resolve({ blob, url: URL.createObjectURL(blob), sizeMB: (blob.size / (1024 * 1024)).toFixed(2) })
            } else {
              quality -= 0.05
              tryCompress()
            }
          }, 'image/jpeg', quality)
        }
        tryCompress()
      }
    }
    reader.readAsDataURL(file)
  })
}


// ─── NEW: RESIZE BY EXACT PIXELS ─────────────────────────────────────

/**
 * Resizes an image to exact pixel dimensions.
 * @param {File} file - Uploaded image
 * @param {number} targetWidth - Target width in pixels
 * @param {number} targetHeight - Target height in pixels
 * @param {string} format - 'image/jpeg' | 'image/png' | 'image/webp'
 * @param {number} quality - 0.0 to 1.0 (only affects jpeg/webp)
 * @returns {Promise<{url, sizeMB, width, height}>}
 */
export async function resizeByPixels(file, targetWidth, targetHeight, format = 'image/jpeg', quality = 0.92) {
  return new Promise((resolve) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = targetWidth
        canvas.height = targetHeight
        const ctx = canvas.getContext('2d')

        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

        canvas.toBlob((blob) => {
          resolve({
            url: URL.createObjectURL(blob),
            sizeMB: (blob.size / (1024 * 1024)).toFixed(2),
            width: targetWidth,
            height: targetHeight,
          })
        }, format, quality)
      }
    }
    reader.readAsDataURL(file)
  })
}


// ─── NEW: RESIZE BY PERCENTAGE ───────────────────────────────────────

/**
 * Resizes an image by a percentage of its original size.
 * e.g. 50 = half size, 200 = double size
 */
export async function resizeByPercent(file, percent, format = 'image/jpeg', quality = 0.92) {
  return new Promise((resolve) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target.result
      img.onload = () => {
        const w = Math.round(img.width * (percent / 100))
        const h = Math.round(img.height * (percent / 100))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, w, h)
        canvas.toBlob((blob) => {
          resolve({
            url: URL.createObjectURL(blob),
            sizeMB: (blob.size / (1024 * 1024)).toFixed(2),
            width: w,
            height: h,
          })
        }, format, quality)
      }
    }
    reader.readAsDataURL(file)
  })
}


// ─── NEW: GET IMAGE DIMENSIONS ───────────────────────────────────────

/**
 * Reads the width and height of an image file without drawing it.
 * Useful for pre-filling the pixel input fields.
 */
export function getImageDimensions(file) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}


// ─── GRID CUTTER ─────────────────────────────────────────────────────

export async function gridCutImage(file, direction, pieces) {
  return new Promise((resolve) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target.result
      img.onload = () => {
        const results = []
        for (let i = 0; i < pieces; i++) {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (direction === 'vertical') {
            const sliceWidth = img.width / pieces
            canvas.width = sliceWidth
            canvas.height = img.height
            ctx.drawImage(img, i * sliceWidth, 0, sliceWidth, img.height, 0, 0, sliceWidth, img.height)
          } else {
            const sliceHeight = img.height / pieces
            canvas.width = img.width
            canvas.height = sliceHeight
            ctx.drawImage(img, 0, i * sliceHeight, img.width, sliceHeight, 0, 0, img.width, sliceHeight)
          }
          results.push({ url: canvas.toDataURL('image/png'), index: i + 1 })
        }
        resolve(results)
      }
    }
    reader.readAsDataURL(file)
  })
}


// ─── CROP HELPER ─────────────────────────────────────────────────────

export async function getCroppedImage(imageSrc, pixelCrop) {
  const image = new Image()
  image.src = imageSrc
  await new Promise((resolve) => (image.onload = resolve))
  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)
  return canvas.toDataURL('image/png')
}