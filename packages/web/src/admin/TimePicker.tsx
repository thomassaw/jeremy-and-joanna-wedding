import { useState, useRef, useEffect } from 'react'
import * as Popover from '@radix-ui/react-popover'

interface Props {
  value: string // HH:MM
  onChange: (value: string) => void
  label: string
}

const slots: string[] = []
for (let h = 0; h < 24; h++) {
  for (const m of ['00', '30']) {
    slots.push(`${String(h).padStart(2, '0')}:${m}`)
  }
}

function format12h(time: string): string {
  const [h, m] = time.split(':')
  const hour = Number(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${h12}:${m} ${ampm}`
}

function formatDisplay(time: string): string {
  if (!time) return 'Pick a time'
  return format12h(time)
}

export default function TimePicker({ value, onChange, label }: Props) {
  const [open, setOpen] = useState(false)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open && activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'center' })
    }
  }, [open])

  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button type="button" className="field-input datepicker-trigger">
            {formatDisplay(value)}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="timepicker-popover" sideOffset={4} align="start" collisionPadding={16}>
            <div className="timepicker-grid">
              {slots.map((slot) => {
                const active = value === slot
                return (
                  <button
                    key={slot}
                    ref={active ? activeRef : undefined}
                    className={`timepicker-cell ${active ? 'active' : ''}`}
                    onClick={() => { onChange(slot); setOpen(false) }}
                  >
                    {format12h(slot)}
                  </button>
                )
              })}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
