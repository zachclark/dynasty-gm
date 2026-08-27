import { ArrowLeftRight, ClipboardCheck } from "lucide-react"
import type { TradeProposal } from "@/lib/audit"
import { SectionLabel } from "./executive-summary"

function AssetList({
  label,
  items,
  tone,
}: {
  label: string
  items: string[]
  tone: "send" | "receive"
}) {
  return (
    <div className="flex-1">
      <div
        className={`mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.15em] ${
          tone === "send" ? "text-destructive" : "text-primary"
        }`}
      >
        {label}
      </div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="rounded border border-border bg-background/60 px-2.5 py-1.5 font-mono text-[13px] text-foreground/90"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function TradeTargets({ trades }: { trades: TradeProposal[] }) {
  return (
    <section aria-labelledby="trades-heading" className="scroll-mt-6">
      <SectionLabel>D. Scouting Director&apos;s Approved Trade Targets</SectionLabel>

      <div className="grid gap-4 lg:grid-cols-3">
        {trades.map((trade, i) => (
          <article
            key={trade.id}
            className="flex flex-col rounded-lg border border-border bg-card/60"
          >
            <div className="flex items-center gap-2 border-b border-border/70 px-4 py-3">
              <ClipboardCheck className="size-4 text-primary" aria-hidden="true" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em]">
                Proposal #{i + 1}: {trade.title}
              </span>
            </div>

            <div className="flex items-stretch gap-2 px-4 py-4">
              <AssetList label="Send" items={trade.send} tone="send" />
              <div className="flex items-center px-1 text-muted-foreground">
                <ArrowLeftRight className="size-5" aria-hidden="true" />
              </div>
              <AssetList label="Receive" items={trade.receive} tone="receive" />
            </div>

            <div className="mt-auto border-t border-border/70 bg-background/40 px-4 py-3">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                Executive Rationale
              </div>
              <p className="text-pretty text-[13px] leading-relaxed text-foreground/85">
                {trade.rationale}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
