interface Props {
  opened: boolean
  onOpen: () => void
}

export default function Cover({ opened, onOpen }: Props) {
  return (
    <section className={`cover${opened ? ' fade-out' : ''}`}>
      <div className="cover-overlay" />
      <div className="cover-content">
        <p className="cover-intro">
          You are cordially invited to<br />the wedding celebration of
        </p>
        <h1 className="cover-names">
          <span className="groom">Jeremy</span>
          <span className="ampersand">&amp;</span>
          <span className="bride">Joanna</span>
        </h1>
        <p className="cover-date">20 . 09 . 2026</p>
        <button className="btn-open" onClick={onOpen}>
          Open Invitation
        </button>
      </div>
    </section>
  )
}
