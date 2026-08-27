export type Severity = "critical" | "warning" | "positive"

export type WhiteboardNote = {
  label: string
  title: string
  note: string
  severity: Severity
}

export type TradeProposal = {
  id: string
  title: string
  send: string[]
  receive: string[]
  rationale: string
}

export type Audit = {
  username: string
  grade: string
  gradeTone: "critical" | "warning" | "positive"
  statusTag: string
  summary: string
  metrics: { label: string; value: string; tone: Severity }[]
  whiteboard: WhiteboardNote[]
  trajectory: number // 0-4 index on the tier spectrum
  trades: TradeProposal[]
}

export const TRAJECTORY_TIERS = [
  "Total Rebuild",
  "Restructuring",
  "Fake Contender",
  "True Contender",
  "Dynasty",
] as const

// Deterministic string hash so a username always returns the same audit.
function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

const PROFILES: Omit<Audit, "username">[] = [
  {
    grade: "D+",
    gradeTone: "critical",
    statusTag: "CAPITAL MISMANAGEMENT / IMMEDIATE REBUILD REQUIRED",
    summary:
      "This roster is a monument to sunk-cost fallacy — you are paying premium prices for depreciating assets while your title window slammed shut two seasons ago. The front office recommends a full teardown before the market fully prices in your decline.",
    metrics: [
      { label: "Roster Value", value: "42nd %ile", tone: "critical" },
      { label: "Avg Age (Core)", value: "28.4 yrs", tone: "warning" },
      { label: "Draft Capital", value: "Bankrupt", tone: "critical" },
      { label: "Win Now Index", value: "17 / 100", tone: "critical" },
    ],
    whiteboard: [
      {
        label: "ASSET LIQUIDITY",
        title: "Holding aging RBs past their sell-by date",
        note: "Three of your top four assets are 27+ RBs. Their trade value evaporates every week you sit on them. Liquidate now or write them off entirely.",
        severity: "critical",
      },
      {
        label: "DEPTH DEFICIT",
        title: "Zero viable QB depth in Superflex",
        note: "One injury to your QB1 and your lineup collapses. In Superflex, this is not a weakness — it is a season-ending structural flaw.",
        severity: "critical",
      },
      {
        label: "DRAFT CAPITAL",
        title: "Traded 2026 & 2027 firsts for rentals",
        note: "You mortgaged the future to chase a ceiling you never had. The cupboard is bare and the rebuild has no ammunition.",
        severity: "warning",
      },
      {
        label: "WINDOW ASSESSMENT",
        title: "Pretender: high value, zero ceiling",
        note: "Your roster looks respectable on a spreadsheet but has no championship equity. You are the definition of the fantasy middle class — too good to pick, too weak to win.",
        severity: "warning",
      },
    ],
    trajectory: 2,
    trades: [
      {
        id: "1",
        title: "ASSET REALLOCATION",
        send: ["Aging RB1", "2027 3rd"],
        receive: ["Young QB2", "2026 1st"],
        rationale:
          "Solves your Superflex QB2 deficit while cashing out an aging back before his market value collapses. Youth and draft capital in one stroke.",
      },
      {
        id: "2",
        title: "WINDOW REALIGNMENT",
        send: ["WR (age 29)", "TE1"],
        receive: ["Rookie WR", "2026 1st", "2027 2nd"],
        rationale:
          "Converts short-shelf-life production into long-term equity. Accept the temporary lineup downgrade — you are not winning now regardless.",
      },
      {
        id: "3",
        title: "DEPTH RECONSTRUCTION",
        send: ["2025 1st (late)"],
        receive: ["Two mid-round rookie picks"],
        rationale:
          "Trade down to spread risk across your barren depth chart. Quantity over a single late first is the correct rebuild math.",
      },
    ],
  },
  {
    grade: "B",
    gradeTone: "warning",
    statusTag: "COMPETITIVE CORE / ONE MOVE FROM CONTENTION",
    summary:
      "You have assembled a legitimately competitive roster, but the front office refuses to hand out participation trophies. A single aggressive move at your soft position separates you from a genuine title run this season.",
    metrics: [
      { label: "Roster Value", value: "71st %ile", tone: "positive" },
      { label: "Avg Age (Core)", value: "25.1 yrs", tone: "positive" },
      { label: "Draft Capital", value: "Adequate", tone: "warning" },
      { label: "Win Now Index", value: "68 / 100", tone: "positive" },
    ],
    whiteboard: [
      {
        label: "ASSET LIQUIDITY",
        title: "Bench value is trapped and idle",
        note: "You are hoarding startable depth that never cracks your lineup. Package it into a single difference-maker before it rots on your taxi squad.",
        severity: "warning",
      },
      {
        label: "DEPTH DEFICIT",
        title: "TE is a black hole every week",
        note: "You are punting a starting slot. Contenders do not concede positions — address the tight end or concede the position battle to your rivals.",
        severity: "warning",
      },
      {
        label: "DRAFT CAPITAL",
        title: "Sitting on picks a contender should spend",
        note: "Rookie picks are currency, not trophies. Convert future capital into present production while your window is open.",
        severity: "positive",
      },
      {
        label: "WINDOW ASSESSMENT",
        title: "True contender ceiling within reach",
        note: "The bones are there. One decisive, uncomfortable trade turns a playoff team into a favorite.",
        severity: "positive",
      },
    ],
    trajectory: 3,
    trades: [
      {
        id: "1",
        title: "CONSOLIDATION STRIKE",
        send: ["WR3", "WR4", "2026 2nd"],
        receive: ["Elite WR1"],
        rationale:
          "Trade quantity for a league-winner. Your bench depth is worth more as a single ceiling-raising asset than as three fringe starters.",
      },
      {
        id: "2",
        title: "POSITION REPAIR",
        send: ["2026 1st"],
        receive: ["Top-5 TE"],
        rationale:
          "Spend future capital to erase your weekly tight end deficit. A contender cannot afford a dead roster slot in the playoffs.",
      },
      {
        id: "3",
        title: "DEPTH INSURANCE",
        send: ["Rookie pick", "Handcuff RB"],
        receive: ["Proven RB2"],
        rationale:
          "Buy a reliable floor at running back so a single injury does not sink your title run. Insurance now, regret never.",
      },
    ],
  },
  {
    grade: "A-",
    gradeTone: "positive",
    statusTag: "DYNASTY IN BLOOM / PROTECT THE ASSET BASE",
    summary:
      "This is front-office-caliber roster construction — young, deep, and loaded with draft capital. The only threat to this franchise is complacency, so the directive is simple: protect the core and pounce on desperate sellers.",
    metrics: [
      { label: "Roster Value", value: "94th %ile", tone: "positive" },
      { label: "Avg Age (Core)", value: "23.6 yrs", tone: "positive" },
      { label: "Draft Capital", value: "Loaded", tone: "positive" },
      { label: "Win Now Index", value: "88 / 100", tone: "positive" },
    ],
    whiteboard: [
      {
        label: "ASSET LIQUIDITY",
        title: "Surplus assets ready to weaponize",
        note: "You have tradeable depth at every position. Use it to buy low on distressed franchises rather than letting it stagnate.",
        severity: "positive",
      },
      {
        label: "DEPTH DEFICIT",
        title: "No structural weaknesses detected",
        note: "Every starting slot is spoken for by an ascending asset. This is what a healthy depth chart looks like.",
        severity: "positive",
      },
      {
        label: "DRAFT CAPITAL",
        title: "Draft war chest is stacked",
        note: "Multiple first-round picks give you optionality to trade up, buy stars, or reload. Do not sit on it passively.",
        severity: "positive",
      },
      {
        label: "WINDOW ASSESSMENT",
        title: "Sustained dynasty window — years, not weeks",
        note: "Your window is not a crack, it is a wide-open door. The mandate is to press the advantage, not coast.",
        severity: "positive",
      },
    ],
    trajectory: 4,
    trades: [
      {
        id: "1",
        title: "OPPORTUNISTIC BUY-LOW",
        send: ["Surplus WR4", "2027 2nd"],
        receive: ["Injured stud WR (buy-low)"],
        rationale:
          "Exploit a panicking owner. Acquire an elite talent at a discount while he is on IR — the definition of front-office arbitrage.",
      },
      {
        id: "2",
        title: "FUTURE FORTIFICATION",
        send: ["Depth RB", "2025 3rd"],
        receive: ["2027 1st", "2027 2nd"],
        rationale:
          "Convert redundant depth into future firsts. Extend the dynasty window by reloading the pipeline before rivals rebuild.",
      },
      {
        id: "3",
        title: "STAR CONSOLIDATION",
        send: ["Two 1sts", "WR3"],
        receive: ["Top-3 dynasty asset"],
        rationale:
          "You can afford to gamble. Package surplus into a generational talent and put the rest of the league on notice.",
      },
    ],
  },
]

export function generateAudit(rawUsername: string): Audit {
  const username = rawUsername.trim() || "unknown_gm"
  const profile = PROFILES[hash(username.toLowerCase()) % PROFILES.length]
  return { username, ...profile }
}
