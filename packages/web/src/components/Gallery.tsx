export default function Gallery() {
  // Replace placeholders with actual image paths in /public/images/
  // e.g. ['/images/photo1.jpg', '/images/photo2.jpg', ...]
  const photos: string[] = []

  return (
    <section className="section gallery-section">
      <div className="container">
        <h3 className="section-title">Our Moments</h3>
        {photos.length === 0 && (
          <p className="gallery-note">Photos coming soon</p>
        )}
        <div className="gallery-grid">
          {photos.length > 0
            ? photos.map((src, i) => (
                <img key={i} src={src} alt={`Jeremy & Joanna moment ${i + 1}`} loading="lazy" />
              ))
            : Array.from({ length: 6 }).map((_, i) => (
                <div className="gallery-placeholder" key={i} />
              ))}
        </div>
      </div>
    </section>
  )
}
