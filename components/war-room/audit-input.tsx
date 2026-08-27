"use client"

import { useState } from "react"
import { LoaderCircle, Target } from "lucide-react"
import { Button } from "@/components/ui/button"

type AuditInputProps = {
  onRun: (username: string) => void
  loading: boolean
  hasResult: boolean
}

export function AuditInput({ onRun, loading, hasResult }: AuditInputProps) {
  const [username, setUsername] = useState("")

  function submit() {
    if (!username.trim() || loading) return
    onRun(username)
  }

  return (
    <section
      className="whiteboard-grid border-b border-border/70 bg-background"
      aria-label="Run franchise audit"
    >
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <Target className="size-3.5 text-primary" aria-hidden="true" />
            Sleeper Franchise Evaluation
          </div>
          <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-4xl">
            Put your roster on the board.
          </h2>
          <p className="mt-3 text-pretty text-sm text-muted-foreground sm:text-base">
            Enter your Sleeper username. The front office will tear the tape,
            grade the franchise, and tell you exactly where the bodies are
            buried.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <label htmlFor="sleeper-username" className="sr-only">
                Sleeper Username
              </label>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">
                @
              </span>
              <input
                id="sleeper-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.nativeEvent.isComposing &&
                    e.keyCode !== 229
                  ) {
                    submit()
                  }
                }}
                placeholder="sleeper_username"
                autoComplete="off"
                spellCheck={false}
                className="h-12 w-full rounded-md border border-input bg-card/80 pl-9 pr-4 font-mono text-sm text-foreground outline-none ring-primary/40 transition placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-2"
              />
            </div>
            <Button
              size="lg"
              onClick={submit}
              disabled={loading || !username.trim()}
              className="h-12 gap-2 font-mono text-sm font-bold uppercase tracking-wider"
            >
              {loading ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  Auditing…
                </>
              ) : (
                <>{hasResult ? "Re-Run Audit" : "Run Franchise Audit"}</>
              )}
            </Button>
          </div>
          <p className="mt-3 font-mono text-[11px] text-muted-foreground/70">
            Demo mode — generates a representative front-office audit for any handle.
          </p>
        </div>
      </div>
    </section>
  )
}
