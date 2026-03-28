import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import * as Popover from '@radix-ui/react-popover'
import 'react-day-picker/style.css'

interface Props {
  value: string // YYYY-MM-DD
  onChange: (value: string) => void
  label: string
}

function formatDisplay(dateStr: string): string {
  if (!dateStr) return 'Pick a date'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function toYMD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function DatePicker({ value, onChange, label }: Props) {
  const [open, setOpen] = useState(false)
  const selected = value ? new Date(value + 'T00:00:00') : undefined

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
          <Popover.Content className="datepicker-popover" sideOffset={4} align="start" collisionPadding={16}>
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={(date) => {
                if (date) {
                  onChange(toYMD(date))
                  setOpen(false)
                }
              }}
              defaultMonth={selected}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
