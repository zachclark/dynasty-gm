"use client"

import { useState } from "react"
import { Check, Copy, Send, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Audit } from "@/lib/audit"
import { TRAJECTORY_TIERS } from "@/lib/audit"
import { SectionLabel } from "./executive-summary"

function buildReport(audit: Audit): string {
  return [
    `FRONT OFFICE ROSTER AUDIT — @${audit.username}`,
    `Franchise Grade: ${audit.grade} — ${audit.statusTag}`,
    `Trajectory: ${TRAJECTORY_TIERS[audit.trajectory]}`,
    "",
    audit.summary,
    "",
    "Hard Truths:",
    ...audit.whiteboard.map((n) => `• ${n.title}`),
    "",
    "Audited in the Franchise War Room.",
  ].join("\n")
}

export function ExportSection({ audit }: { audit: Audit }) {
  const [copied, setCopied] = useState(false)
  const report = buildReport(audit)
  const encoded = encodeURIComponent(report)

  const shares = [
    {
      name: "Reddit",
      href: `https://www.reddit.com/submit?title=${encodeURIComponent(
        `My Franchise Audit: Grade ${audit.grade}`,
      )}&text=${encoded}`,
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?text=${encoded}`,
    },
    {
      name: "Discord",
      href: "https://discord.com/channels/@me",
    },
  ]

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(report)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section aria-labelledby="export-heading" className="scroll-mt-6">
      <SectionLabel>E. Export to Franchise Owners</SectionLabel>

      <div className="rounded-lg border border-border bg-card/60 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wide">
              <Share2 className="size-4 text-primary" aria-hidden="true" />
              Post the Scouting Report
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Blast the verdict to your league. Let the group chat argue.
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={copyReport}
            className="gap-2 font-mono text-xs font-bold uppercase tracking-wider"
          >
            {copied ? (
              <>
                <Check className="size-4 text-primary" aria-hidden="true" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-4" aria-hidden="true" />
                Copy Audit
              </>
            )}
          </Button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {shares.map((s) => (
            <Button
              key={s.name}
              variant="outline"
              className="h-11 gap-2 font-mono text-xs font-bold uppercase tracking-wider"
              render={
                <a href={s.href} target="_blank" rel="noopener noreferrer" />
              }
            >
              <Send className="size-4" aria-hidden="true" />
              Share on {s.name}
            </Button>
          ))}
        </div>
      </div>
    </section>
  )
}
