import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Disable response caching on Next.js / Vercel
export const dynamic = 'force-dynamic';

async function getPlayerMap(): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  try {
    // Official DynastyProcess ID mapping CSV
    const res = await fetch("https://raw.githubusercontent.com/dynastyprocess/data/master/files/db_playerids.csv");
    if (!res.ok) throw new Error(`Player CSV returned HTTP ${res.status}`);
    
    const csvText = await res.text();
    const lines = csvText.split("\n");
    if (lines.length === 0) return map;

    const header = lines[0].split(",").map(h => h.trim().replace(/"/g, ''));
    const sleeperIdx = header.indexOf("sleeper_id");
    const nameIdx = header.indexOf("name");

    for (let i = 1; i < lines.length; i++) {
      const col = lines[i].split(",");
      if (col.length > 1) {
        const sleeperId = col[sleeperIdx]?.replace(/"/g, '').trim();
        const name = col[nameIdx]?.replace(/"/g, '').trim();
        if (sleeperId && name) {
          map[sleeperId] = name;
        }
      }
    }
  } catch (err) {
    console.error("[Audit Route] Error loading player map:", err);
  }
  return map;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    console.log(`[Audit Route] Fetching Sleeper user: ${username}`);

    // 1. Fetch Sleeper User ID
    const userRes = await fetch(`https://api.sleeper.app/v1/user/${username}`);
    if (!userRes.ok) {
      return NextResponse.json({ error: `Sleeper username "${username}" not found` }, { status: 404 });
    }
    const userData = await userRes.json();
    if (!userData || !userData.user_id) {
      return NextResponse.json({ error: "User ID missing on Sleeper" }, { status: 404 });
    }

    // 2. Fetch Leagues (Check 2026, 2025, 2024)
    let leagues: any[] = [];
    const currentYear = new Date().getFullYear();
    const yearsToCheck = [currentYear, currentYear - 1, currentYear - 2];

    for (const year of yearsToCheck) {
      const leaguesRes = await fetch(`https://api.sleeper.app/v1/user/${userData.user_id}/leagues/nfl/${year}`);
      if (leaguesRes.ok) {
        const data = await leaguesRes.json();
        if (data && data.length > 0) {
          leagues = data;
          console.log(`[Audit Route] Found ${leagues.length} leagues for ${year}`);
          break;
        }
      }
    }

    if (leagues.length === 0) {
      return NextResponse.json({ error: `No active Sleeper leagues found for user "${username}".` }, { status: 404 });
    }

    const league = leagues[0];
    console.log(`[Audit Route] Selected League: ${league.name} (${league.league_id})`);

    // 3. Fetch Rosters
    const rostersRes = await fetch(`https://api.sleeper.app/v1/league/${league.league_id}/rosters`);
    const rosters = await rostersRes.json();
    
    const userRoster = rosters.find((r: any) => r.owner_id === userData.user_id);
    if (!userRoster || !userRoster.players || userRoster.players.length === 0) {
      return NextResponse.json({ error: "No players found on this user's roster." }, { status: 404 });
    }

    // 4. Map Player IDs to Names
    const playerMap = await getPlayerMap();
    
    const startersNames = (userRoster.starters || []).map((id: string) => playerMap[id] || `Player ${id}`);
    const benchNames = (userRoster.players || [])
      .filter((id: string) => !(userRoster.starters || []).includes(id))
      .map((id: string) => playerMap[id] || `Player ${id}`);

    console.log(`[Audit Route] Starters parsed:`, startersNames);

    // 5. Generate Audit via Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY environment variable is missing on Vercel." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `You are an elite, sarcastic, high-expertise dynasty fantasy football analyst.
Audit this dynasty team for manager "${username}" in the league "${league.name}".

Starters: ${startersNames.join(", ")}
Bench: ${benchNames.join(", ")}

Write a highly personalized, ruthless audit. You MUST explicitly reference several real player names from their roster.
Return ONLY raw JSON with these exact keys:
{
  "grade": "Letter grade like A-, C+, F",
  "tier": "Short tier like 'Contender', 'Rebuilding Disaster', 'Fake Contender'",
  "summary": "2-3 punchy sentences roasting their team build and naming specific players.",
  "strengths": ["Bullet point praising a specific positional group or player", "Another strength point"],
  "weaknesses": ["Bullet point roasting a flaw or aging player", "Another weakness point"],
  "roast": "2 hilarious, brutal sentences mocking their roster."
}

Do not include markdown blocks like \`\`\`json.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || "";
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const auditData = JSON.parse(cleanJson);

    return NextResponse.json(auditData);

  } catch (err: any) {
    console.error("[Audit Route Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to generate audit" }, { status: 500 });
  }
}