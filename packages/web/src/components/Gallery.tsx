import { useState } from 'react'

// Add image filenames from /public/images/album/
const photos: string[] = []

export default function Gallery() {
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (photos.length === 0) return null

  function prev() {
    setLightbox((i) => (i !== null ? (i - 1 + photos.length) % photos.length : null))
  }

  function next() {
    setLightbox((i) => (i !== null ? (i + 1) % photos.length : null))
  }

  return (
    <section className="section gallery-section">
      <div className="container">
        <h3 className="section-title">Our Moments</h3>
        <div className="gallery-grid">
          {photos.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Joanna & Jeremy moment ${i + 1}`}
              loading="lazy"
              onClick={() => setLightbox(i)}
            />
          ))}
        </div>
      </div>

      {lightbox !== null && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>&times;</button>
          <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); prev() }}>&lsaquo;</button>
          <img
            className="lightbox-img"
            src={photos[lightbox]}
            alt={`Photo ${lightbox + 1}`}
            onClick={(e) => e.stopPropagation()}
          />
          <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); next() }}>&rsaquo;</button>
        </div>
      )}
    </section>
  )
}
