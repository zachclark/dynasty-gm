import { ShieldAlert } from "lucide-react"

export function WarRoomHeader() {
  return (
    <header className="border-b border-border/70 bg-card/40">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-6 sm:px-8">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
          <ShieldAlert className="size-4" aria-hidden="true" />
          <span>Confidential — Front Office Eyes Only</span>
        </div>
        <h1 className="text-balance font-mono text-xl font-bold uppercase leading-tight tracking-tight sm:text-3xl">
          Franchise War Room
          <span className="mx-2 text-muted-foreground">|</span>
          <span className="text-primary">Front Office Roster Audit</span>
        </h1>
        <p className="max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
          No sentimentality. No homer bias. Just cold executive valuation.
        </p>
      </div>
    </header>
  )
}
