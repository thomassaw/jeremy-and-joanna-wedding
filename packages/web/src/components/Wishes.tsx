import type { Wish } from '../App'

interface Props {
  wishes: Wish[]
}

export default function Wishes({ wishes }: Props) {
  return (
    <section className="section wishes-section">
      <div className="container">
        <h3 className="section-title">Wishes</h3>
        <div className="wishes-wall">
          {wishes.length === 0 && (
            <div className="wish-card">
              <p className="wish-text">
                "Wishing you both a lifetime of love and happiness!"
              </p>
              <p className="wish-author">- With love, Family &amp; Friends</p>
            </div>
          )}
          {wishes.map((w, i) => (
            <div className="wish-card" key={i}>
              <p className="wish-text">"{w.text}"</p>
              <p className="wish-author">- {w.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
