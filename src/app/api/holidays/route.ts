import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year') || new Date().getFullYear().toString();
  const state = searchParams.get('state') || 'NW';

  try {
    // Wir nutzen hier feiertage-api.de als stabilen Endpunkt für deutsche Feiertage
    const apiUrl = `https://feiertage-api.de/api/?jahr=${year}&nur_land=${state}`;

    const response = await fetch(apiUrl, {
      next: { revalidate: 2592000 }, // Aggressives Caching: 30 Tage
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch holidays: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Die API liefert oft ein Objekt { "Neujahrstag": { "datum": "2026-01-01" }, ... }
    // Wir transformieren es in ein Record<string, string> { "2026-01-01": "Neujahrstag", ... }
    const holidayMap: Record<string, string> = {};
    for (const [name, holiday] of Object.entries<any>(data)) {
      holidayMap[holiday.datum] = name;
    }

    return NextResponse.json(holidayMap);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return NextResponse.json({ error: 'Failed to fetch holidays' }, { status: 500 });
  }
}
