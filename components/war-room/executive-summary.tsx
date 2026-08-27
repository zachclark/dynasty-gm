import type { Audit, Severity } from "@/lib/audit"

const toneText: Record<Severity, string> = {
  critical: "text-destructive",
  warning: "text-warning",
  positive: "text-primary",
}

const gradeRing: Record<Audit["gradeTone"], string> = {
  critical: "border-destructive/50 bg-destructive/10 text-destructive",
  warning: "border-warning/50 bg-warning/10 text-warning",
  positive: "border-primary/50 bg-primary/10 text-primary",
}

export function ExecutiveSummary({ audit }: { audit: Audit }) {
  return (
    <section aria-labelledby="exec-heading" className="scroll-mt-6">
      <SectionLabel>A. Executive Summary &amp; Franchise Grade</SectionLabel>

      <div className="grid gap-4 rounded-lg border border-border bg-card/60 p-5 sm:p-6 md:grid-cols-[auto_1fr] md:gap-8">
        <div className="flex flex-col items-center justify-center gap-3 md:border-r md:border-border/70 md:pr-8">
          <div
            className={`flex size-28 items-center justify-center rounded-xl border-2 font-mono text-5xl font-bold tabular-nums sm:size-32 sm:text-6xl ${gradeRing[audit.gradeTone]}`}
          >
            {audit.grade}
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Franchise Grade
          </span>
        </div>

        <div className="flex flex-col justify-center gap-4">
          <div>
            <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Executive Sub-Status
            </div>
            <p
              className={`font-mono text-sm font-bold uppercase leading-snug tracking-wide sm:text-base ${toneText[audit.gradeTone]}`}
            >
              {audit.statusTag}
            </p>
          </div>
          <div className="h-px bg-border/70" />
          <div>
            <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              GM&apos;s Note — RE: @{audit.username}
            </div>
            <p className="text-pretty text-sm leading-relaxed text-foreground/90 sm:text-base">
              {audit.summary}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {audit.metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-lg border border-border bg-card/40 p-4"
          >
            <div
              className={`font-mono text-lg font-bold tabular-nums sm:text-xl ${toneText[m.tone]}`}
            >
              {m.value}
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              {m.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">
      <span className="h-px flex-none bg-primary/40" style={{ width: 20 }} />
      {children}
    </h3>
  )
}
