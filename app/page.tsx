"use client"

import { useState } from "react"
import { Flame } from "lucide-react"
import { generateAudit, type Audit } from "@/lib/audit"
import { WarRoomHeader } from "@/components/war-room/war-room-header"
import { AuditInput } from "@/components/war-room/audit-input"
import { ExecutiveSummary } from "@/components/war-room/executive-summary"
import { Whiteboard } from "@/components/war-room/whiteboard"
import { TrajectoryMeter } from "@/components/war-room/trajectory-meter"
import { TradeTargets } from "@/components/war-room/trade-targets"
import { ExportSection } from "@/components/war-room/export-section"

export default function Page() {
  const [audit, setAudit] = useState<Audit | null>(null)
  const [loading, setLoading] = useState(false)

  function runAudit(username: string) {
    setLoading(true)
    // Simulated war-room processing delay.
    setTimeout(() => {
      setAudit(generateAudit(username))
      setLoading(false)
    }, 900)
  }

  return (
    <main className="min-h-dvh bg-background">
      <WarRoomHeader />
      <AuditInput onRun={runAudit} loading={loading} hasResult={!!audit} />

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-12">
        {loading && !audit && <AuditPending />}

        {!loading && !audit && <EmptyState />}

        {audit && (
          <div className="flex flex-col gap-10">
            <ExecutiveSummary audit={audit} />
            <Whiteboard notes={audit.whiteboard} />
            <TrajectoryMeter trajectory={audit.trajectory} />
            <TradeTargets trades={audit.trades} />
            <ExportSection audit={audit} />
          </div>
        )}
      </div>

      <footer className="border-t border-border/70 py-6 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60">
        Franchise War Room — Front Office Analytics
      </footer>
    </main>
  )
}

function EmptyState() {
  return (
    <div className="field-lines flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/30 px-6 py-16 text-center">
      <Flame className="size-8 text-primary" aria-hidden="true" />
      <p className="mt-4 font-mono text-sm font-bold uppercase tracking-[0.15em] text-foreground">
        The board is clean.
      </p>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Enter a Sleeper username above and run the audit. The front office does
        not grade on a curve.
      </p>
    </div>
  )
}

function AuditPending() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-40 animate-pulse rounded-lg border border-border bg-card/40" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg border border-border bg-card/40"
          />
        ))}
      </div>
    </div>
  )
}
