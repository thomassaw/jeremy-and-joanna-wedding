interface Props {
  playing: boolean
  onToggle: () => void
}

export default function MusicToggle({ playing, onToggle }: Props) {
  return (
    <button
      className="music-toggle"
      onClick={onToggle}
      aria-label="Toggle Music"
    >
      <span className={`music-icon ${playing ? 'playing' : 'paused'}`}>
        &#9835;
      </span>
    </button>
  )
}
