export default function Venue() {
  return (
    <section className="section venue-section">
      <div className="container">
        <h3 className="section-title">Venue</h3>
        <p className="venue-name">M Resort &amp; Hotel Kuala Lumpur</p>
        <p className="venue-address">
          Al-Messra Sdn Bhd, Jalan Damai, Off Jalan Ampang,
          <br />
          55000 Kuala Lumpur, Malaysia
        </p>
        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.786!2d101.7372!3d3.1590!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc37d3a42e95e1%3A0x1e3f2e5f36e0a40!2sM+Resort+%26+Hotel+Kuala+Lumpur!5e0!3m2!1sen!2smy!4v1"
            width="100%"
            height="350"
            style={{ border: 0, borderRadius: '12px' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="M Resort & Hotel Kuala Lumpur"
          />
        </div>
        <div className="venue-buttons">
          <a
            href="https://maps.google.com/?q=M+Resort+%26+Hotel+Kuala+Lumpur"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            Google Maps
          </a>
          <a
            href="https://www.waze.com/ul?q=M+Resort+%26+Hotel+Kuala+Lumpur"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            Waze
          </a>
        </div>
      </div>
    </section>
  )
}
