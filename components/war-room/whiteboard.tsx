import { TrendingDown, TriangleAlert, CircleDot, Trophy } from "lucide-react"
import type { Severity, WhiteboardNote } from "@/lib/audit"
import { SectionLabel } from "./executive-summary"

const severityStyle: Record<
  Severity,
  { accent: string; chip: string; icon: string }
> = {
  critical: {
    accent: "before:bg-destructive",
    chip: "border-destructive/40 bg-destructive/10 text-destructive",
    icon: "text-destructive",
  },
  warning: {
    accent: "before:bg-warning",
    chip: "border-warning/40 bg-warning/10 text-warning",
    icon: "text-warning",
  },
  positive: {
    accent: "before:bg-primary",
    chip: "border-primary/40 bg-primary/10 text-primary",
    icon: "text-primary",
  },
}

const icons = [TrendingDown, TriangleAlert, CircleDot, Trophy]

export function Whiteboard({ notes }: { notes: WhiteboardNote[] }) {
  return (
    <section aria-labelledby="whiteboard-heading" className="scroll-mt-6">
      <SectionLabel>B. War Room Whiteboard: Hard Truths</SectionLabel>

      <div className="whiteboard-grid rounded-lg border border-border bg-background/60 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {notes.map((note, i) => {
            const style = severityStyle[note.severity]
            const Icon = icons[i % icons.length]
            return (
              <article
                key={note.label}
                className={`relative overflow-hidden rounded-md border border-border bg-card/80 p-4 pl-5 before:absolute before:inset-y-0 before:left-0 before:w-1 ${style.accent}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] ${style.chip}`}
                  >
                    {note.label}
                  </span>
                  <Icon className={`size-4 ${style.icon}`} aria-hidden="true" />
                </div>
                <h4 className="mt-3 font-mono text-sm font-bold leading-snug text-foreground">
                  {note.title}
                </h4>
                <p className="mt-2 text-pretty text-[13px] leading-relaxed text-muted-foreground">
                  {note.note}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
