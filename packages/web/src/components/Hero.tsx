const HERO_IMAGE = '/images/hero.jpg'

interface Props {
  groomName: string
  brideName: string
}

export default function Hero({ groomName, brideName }: Props) {
  return (
    <section className="section hero">
      <div className="container">
        <p className="script-text">Together with their families</p>
        <h2 className="couple-names">
          <span className="bride-full">{brideName}</span>
          <span className="amp">&amp;</span>
          <span className="groom-full">{groomName}</span>
        </h2>
        <p className="invite-line">
          request the pleasure of your company<br />
          at the celebration of their marriage
        </p>
        <div className="hero-photo">
          <img src={HERO_IMAGE} alt={`${brideName} & ${groomName}`} />
        </div>
        <div className="divider" />
      </div>
    </section>
  )
}
