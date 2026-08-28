import { NextRequest, NextResponse } from "next/server";

// Cache player map in memory across hot serverless requests
let playerMapCache: Record<string, { name: string; pos: string; team: string }> | null = null;

async function getPlayerMap() {
  if (playerMapCache) return playerMapCache;

  try {
    // Fetch lightweight player metadata
    const res = await fetch("https://raw.githubusercontent.com/dynastyprocess/godmode/main/data/values-players.csv");
    const csvText = await res.text();
    
    const map: Record<string, { name: string; pos: string; team: string }> = {};
    const lines = csvText.split("\n").slice(1);

    for (const line of lines) {
      const cols = line.split(",");
      if (cols.length > 5) {
        const sleeperId = cols[8]?.replace(/"/g, "").trim(); // sleeper_id column
        const name = cols[0]?.replace(/"/g, "").trim();       // player name
        const pos = cols[2]?.replace(/"/g, "").trim();        // position
        const team = cols[3]?.replace(/"/g, "").trim();       // team

        if (sleeperId) {
          map[sleeperId] = { name, pos, team };
        }
      }
    }
    playerMapCache = map;
    return map;
  } catch (err) {
    console.error("Failed to load player map", err);
    return {};
  }
}

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    // 1. Get Sleeper User ID
    const userRes = await fetch(`https://api.sleeper.app/v1/user/${username}`);
    const userData = await userRes.json();
    if (!userData || !userData.user_id) {
      return NextResponse.json({ error: "Sleeper user not found" }, { status: 404 });
    }

    // 2. Get User's Dynasty Leagues (NFL 2026 / latest)
    const leaguesRes = await fetch(
      `https://api.sleeper.app/v1/user/${userData.user_id}/leagues/nfl/2026`
    );
    let leagues = await leaguesRes.json();
    
    // Fallback to 2025 if 2026 leagues haven't renewed yet
    if (!leagues || leagues.length === 0) {
      const fallbackRes = await fetch(
        `https://api.sleeper.app/v1/user/${userData.user_id}/leagues/nfl/2025`
      );
      leagues = await fallbackRes.json();
    }

    if (!leagues || leagues.length === 0) {
      return NextResponse.json({ error: "No active Sleeper dynasty leagues found for this user." }, { status: 404 });
    }

    const primaryLeague = leagues[0];

    // 3. Get League Rosters
    const rostersRes = await fetch(
      `https://api.sleeper.app/v1/league/${primaryLeague.league_id}/rosters`
    );
    const rosters = await rostersRes.json();
    const userRoster = rosters.find((r: any) => r.owner_id === userData.user_id);

    if (!userRoster) {
      return NextResponse.json({ error: "Roster not found in user's primary league." }, { status: 404 });
    }

    // 4. Resolve Numeric Player IDs to Human Names
    const playerMap = await getPlayerMap();

    const starters = (userRoster.starters || []).map(
      (id: string) => playerMap[id] ? `${playerMap[id].name} (${playerMap[id].pos}-${playerMap[id].team})` : `Player ${id}`
    );

    const bench = (userRoster.players || [])
      .filter((id: string) => !userRoster.starters?.includes(id))
      .map((id: string) => playerMap[id] ? `${playerMap[id].name} (${playerMap[id].pos}-${playerMap[id].team})` : `Player ${id}`);

    // 5. Build Rich Context Payload for Gemini
    const payload = {
      leagueName: primaryLeague.name,
      totalTeams: primaryLeague.total_rosters,
      wins: userRoster.settings?.wins || 0,
      losses: userRoster.settings?.losses || 0,
      fpts: userRoster.settings?.fpts || 0,
      startingLineup: starters,
      benchPlayers: bench,
    };

    // 6. Gemini System Prompt (Brutally Honest NFL GM Persona)
    const systemPrompt = `You are an elite, cynical, zero-nonsense NFL General Manager doing a War Room audit of a Dynasty Fantasy Football roster.
    
    CRITICAL INSTRUCTIONS:
    - You MUST reference SPECIFIC players from the user's startingLineup and benchPlayers by name.
    - Call out exact roster flaws (e.g., aging stars, zero QB depth, roster cloggers).
    - Tone: Brutally honest, direct, strategic, humorous tough love. Do NOT be polite or validation-seeking.
    
    Return ONLY a valid raw JSON object matching this exact structure:
    {
      "grade": "Letter grade (e.g. D+)",
      "status": "Short title (e.g. FAKE CONTENDER)",
      "roast": "2-3 sentence brutally direct GM assessment mentioning specific players on their roster.",
      "hardTruths": [
        "Specific criticism about player X or position group Y",
        "Specific draft capital or roster construction mistake",
        "Specific age cliff or depth warning"
      ],
      "tradeTargets": [
        {"send": "Player/Asset on user's roster", "receive": "Target position/type", "reason": "Execution rationale"}
      ]
    }`;

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\nUSER ROSTER PAYLOAD:\n${JSON.stringify(payload, null, 2)}` }],
            },
          ],
        }),
      }
    );

    const aiData = await aiRes.json();
    if (!aiData.candidates || !aiData.candidates[0]?.content?.parts[0]?.text) {
      throw new Error("Invalid response from Gemini API");
    }

    const rawText = aiData.candidates[0].content.parts[0].text;
    const cleanedJson = rawText.replace(/```json|```/g, "").trim();
    const auditResult = JSON.parse(cleanedJson);

    return NextResponse.json(auditResult);
  } catch (err: any) {
    console.error("Audit API Error:", err);
    return NextResponse.json({ error: "Failed to generate audit", details: err.message }, { status: 500 });
  }
}