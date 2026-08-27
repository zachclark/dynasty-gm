import { NextRequest, NextResponse } from "next/server";

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

    // 2. Get User's Dynasty Leagues (NFL 2026)
    const leaguesRes = await fetch(
      `https://api.sleeper.app/v1/user/${userData.user_id}/leagues/nfl/2026`
    );
    const leagues = await leaguesRes.json();
    if (!leagues || leagues.length === 0) {
      return NextResponse.json({ error: "No active 2026 leagues found" }, { status: 404 });
    }

    const primaryLeague = leagues[0];

    // 3. Get League Rosters
    const rostersRes = await fetch(
      `https://api.sleeper.app/v1/league/${primaryLeague.league_id}/rosters`
    );
    const rosters = await rostersRes.json();
    const userRoster = rosters.find((r: any) => r.owner_id === userData.user_id);

    // 4. Pre-Math Payload (Simplified for MVP)
    const payload = {
      leagueName: primaryLeague.name,
      totalStarters: userRoster?.starters?.length || 0,
      totalPlayersOnRoster: userRoster?.players?.length || 0,
      draftPicksOwned: userRoster?.taxi?.length || 0, // Placeholder metric
      wins: userRoster?.settings?.wins || 0,
      losses: userRoster?.settings?.losses || 0,
      fpts: userRoster?.settings?.fpts || 0,
    };

    // 5. Call Free Gemini Flash API
    const systemPrompt = `You are an elite, zero-nonsense NFL General Manager doing a War Room audit of a Dynasty roster. 
    Tone: Brutally honest, direct, analytical, humorous tough love. Do NOT validate user bias.
    Return JSON matching this exact structure:
    {
      "grade": "Letter grade (e.g. D+)",
      "status": "Short title (e.g. FAKE CONTENDER)",
      "roast": "2 sentence executive summary of what is wrong with this roster",
      "hardTruths": ["Truth 1", "Truth 2", "Truth 3"],
      "tradeTargets": [
        {"send": "Asset A", "receive": "Asset B", "reason": "Execution rationale"}
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
              parts: [{ text: `${systemPrompt}\n\nRoster Payload:\n${JSON.stringify(payload)}` }],
            },
          ],
        }),
      }
    );

    const aiData = await aiRes.json();
    const rawText = aiData.candidates[0].content.parts[0].text;
    
    // Clean JSON markdown blocks if returned
    const cleanedJson = rawText.replace(/```json|```/g, "").trim();
    const auditResult = JSON.parse(cleanedJson);

    return NextResponse.json(auditResult);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to generate audit", details: err.message }, { status: 500 });
  }
}