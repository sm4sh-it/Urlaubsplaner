import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year') || new Date().getFullYear().toString();
  const state = searchParams.get('state') || 'NW';

  try {
    // Wir nutzen hier openholidaysapi.org für deutsche Schulferien, da ferien-api.de oft Rate Limits hat
    const apiUrl = `https://openholidaysapi.org/SchoolHolidays?countryIsoCode=DE&languageIsoCode=DE&validFrom=${year}-01-01&validTo=${year}-12-31&subdivisionCode=DE-${state}`;

    const response = await fetch(apiUrl, {
      next: { revalidate: 2592000 }, // Aggressives Caching: 30 Tage
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch vacations: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Die API liefert ein Objekt mit 'value' Array
    const vacations = data.value.map((vacation: any) => ({
      start: vacation.startDate,
      end: vacation.endDate,
      name: vacation.name.find((n: any) => n.language === 'DE')?.text || 'Ferien'
    }));

    return NextResponse.json(vacations);
  } catch (error) {
    console.error('Error fetching vacations:', error);
    return NextResponse.json({ error: 'Failed to fetch vacations' }, { status: 500 });
  }
}
