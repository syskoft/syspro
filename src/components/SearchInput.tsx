import { Search } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = 'Buscar...' }: Props) {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-44 rounded-md border border-input bg-background pl-6 pr-2 text-xs"
        placeholder={placeholder}
      />
    </div>
  )
}
