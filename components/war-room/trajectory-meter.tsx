import { Gauge } from "lucide-react"
import { TRAJECTORY_TIERS } from "@/lib/audit"
import { SectionLabel } from "./executive-summary"

export function TrajectoryMeter({ trajectory }: { trajectory: number }) {
  const pct = (trajectory / (TRAJECTORY_TIERS.length - 1)) * 100

  return (
    <section aria-labelledby="trajectory-heading" className="scroll-mt-6">
      <SectionLabel>C. Franchise Trajectory Meter</SectionLabel>

      <div className="rounded-lg border border-border bg-card/60 p-5 sm:p-6">
        <div className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
          <Gauge className="size-4 text-primary" aria-hidden="true" />
          Current Standing:
          <span className="font-bold text-primary">
            {TRAJECTORY_TIERS[trajectory]}
          </span>
        </div>

        {/* Track */}
        <div className="relative">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-destructive via-warning to-primary transition-[width] duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          {/* Marker */}
          <div
            className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow-lg transition-[left] duration-700 ease-out"
            style={{ left: `${pct}%` }}
            aria-hidden="true"
          />
        </div>

        {/* Tier labels */}
        <div className="mt-4 grid grid-cols-5 gap-1">
          {TRAJECTORY_TIERS.map((tier, i) => (
            <div
              key={tier}
              className={`text-center font-mono text-[10px] uppercase leading-tight tracking-wide sm:text-[11px] ${
                i === trajectory
                  ? "font-bold text-foreground"
                  : "text-muted-foreground/60"
              }`}
            >
              {tier}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
