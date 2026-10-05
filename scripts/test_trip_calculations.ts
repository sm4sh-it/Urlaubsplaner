import { getTripDayVacationCost, calculateTripVacationCost } from '../src/lib/tripUtils';
import { getProfileStatsForYear } from '../src/lib/profileUtils';
import type { Trip, Profile, CalendarEntry } from '../src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

const dummyProfile: Profile = {
  id: 'user-1',
  name: 'Max Mustermann',
  color: '#3b82f6',
  annualLeave: 30,
  remainingLeave: 5,
  additionalLeave: 0,
  remainingLeaveExpiryDate: '03-31',
  stateCode: 'NW',
  startYear: 2026,
  workingDays: '1,2,3,4,5', // Mo-Fr
};

console.log('--- TEST 1: Standard Fr-Mo Trip with Feierabend-Abreise (Start=NONE) ---');
// 2026-06-05 is Friday, 2026-06-08 is Monday
const tripFrMoFeierabend: Trip = {
  id: 'trip-1',
  title: 'Wochenendtrip',
  startDate: '2026-06-05', // Friday
  endDate: '2026-06-08',   // Monday
  duration: 4,
  profiles: [{ id: 'user-1' }],
  type: 'Urlaub',
  status: 'Gebucht',
  startDayType: 'NONE',    // Feierabend (0 Tage)
  endDayType: 'FULL',      // Montag voll (1 Tag)
  isHalfDay: false,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

// Friday: 0, Sa: 0, So: 0, Mo: 1 -> Total = 1.0
const cost1 = calculateTripVacationCost(tripFrMoFeierabend, dummyProfile);
assert(cost1 === 1.0, `Expected 1.0 days vacation for Fr(Feierabend)-Mo, got ${cost1}`);

console.log('\n--- TEST 2: Fr-Mo Trip with Halbtag Abreise (Start=HALF) ---');
const tripFrMoHalf: Trip = {
  ...tripFrMoFeierabend,
  id: 'trip-2',
  startDayType: 'HALF',
  endDayType: 'FULL',
};
// Friday: 0.5, Sa: 0, So: 0, Mo: 1.0 -> Total = 1.5
const cost2 = calculateTripVacationCost(tripFrMoHalf, dummyProfile);
assert(cost2 === 1.5, `Expected 1.5 days vacation for Fr(Half)-Mo, got ${cost2}`);

console.log('\n--- TEST 3: 4-Day Work Week (Mo-Do) with Do Feierabend ---');
const profile4Days: Profile = {
  ...dummyProfile,
  workingDays: '1,2,3,4', // Mo-Do
};
// Trip from Thursday (2026-06-04) to Monday (2026-06-08)
// Thursday: NONE (0), Friday: not a working day (0), Sat: 0, Sun: 0, Mon: working day (1) -> Total = 1.0
const tripDoMo: Trip = {
  ...tripFrMoFeierabend,
  id: 'trip-3',
  startDate: '2026-06-04', // Thursday
  endDate: '2026-06-08',   // Monday
  startDayType: 'NONE',
  endDayType: 'FULL',
};
const cost3 = calculateTripVacationCost(tripDoMo, profile4Days);
assert(cost3 === 1.0, `Expected 1.0 day for 4-day week Do(Feierabend)-Mo, got ${cost3}`);

console.log('\n--- TEST 4: 14-Day Workation (isHalfDay = true, secondaryType = "M") ---');
// 2026-06-01 (Mo) to 2026-06-14 (So) -> exactly 2 weeks = 10 workdays, 4 weekend days
const tripWorkation: Trip = {
  ...tripFrMoFeierabend,
  id: 'trip-4',
  startDate: '2026-06-01',
  endDate: '2026-06-14',
  title: 'Workation Teneriffa',
  startDayType: 'FULL',
  endDayType: 'FULL',
  isHalfDay: true,
  halfDayType: 'FIRST_HALF',
  secondaryType: 'M',
};
const cost4 = calculateTripVacationCost(tripWorkation, dummyProfile);
// 10 workdays * 0.5 = 5.0 vacation days
assert(cost4 === 5.0, `Expected 5.0 vacation days for 2-week workation, got ${cost4}`);

console.log('\n--- TEST 5: Illness Override (Krankheit auf Urlaubstag überschreibt Abzug) ---');
// Trip Mon 2026-06-01 to Wed 2026-06-03 (3 full days = 3 vacation days)
const tripWithSick: Trip = {
  ...tripFrMoFeierabend,
  id: 'trip-5',
  startDate: '2026-06-01',
  endDate: '2026-06-03',
  title: 'Sommerurlaub',
  startDayType: 'FULL',
  endDayType: 'FULL',
};
const entriesWithSick: CalendarEntry[] = [
  {
    id: 'entry-sick-1',
    profileId: 'user-1',
    date: '2026-06-02', // Tuesday: sick
    type: '3', // Krank
  },
];
const costWithoutSick = calculateTripVacationCost(tripWithSick, dummyProfile);
assert(costWithoutSick === 3.0, `Expected 3.0 days without sick entry, got ${costWithoutSick}`);

const costWithSick = calculateTripVacationCost(tripWithSick, dummyProfile, {}, undefined, entriesWithSick);
// Mo: 1, Di: 0 (krank), Mi: 1 -> Total = 2.0
assert(costWithSick === 2.0, `Expected 2.0 days with sick entry on Tuesday, got ${costWithSick}`);

console.log('\n--- TEST 6: Resturlaub / Profile Carry-over Integration with getProfileStatsForYear ---');
// Profile startYear 2025, annualLeave 30, remainingLeave 0
const profileMultiYear: Profile = {
  ...dummyProfile,
  startYear: 2025,
  annualLeave: 30,
  remainingLeave: 0,
};

// In 2025: Trip Fr-Mo where Friday is Feierabend (NONE). Sa/So off. Monday 1.0 day vacation.
// Cost = 1.0 day.
const trip2025: Trip = {
  ...tripFrMoFeierabend,
  id: 'trip-2025',
  startDate: '2025-06-06', // Friday
  endDate: '2025-06-09',   // Monday
  startDayType: 'NONE',
  endDayType: 'FULL',
};

// 2025 stats: available = 30, used = 1.0 -> Remaining for 2026 = 29.0!
// (If Friday wasn't NONE, it would have been 2.0 days used -> 28.0 remaining).
const stats2026 = getProfileStatsForYear(profileMultiYear, 2026, [], [], [trip2025]);
assert(stats2026 !== null, 'Stats for 2026 should not be null');
assert(stats2026!.remainingLeave === 29.0, `Expected 2026 remainingLeave to be 29.0, got ${stats2026?.remainingLeave}`);
assert(stats2026!.totalAvailable === 59.0, `Expected 2026 totalAvailable to be 59.0 (30 + 29), got ${stats2026?.totalAvailable}`);

console.log('\n--- TEST 7: Feierabend End Day (endDayType = "NONE") ---');
// Trip Mon 2026-06-01 to Wed 2026-06-03, where Wednesday returns in the early morning before work (NONE)
const tripReturnEarly: Trip = {
  ...tripFrMoFeierabend,
  id: 'trip-7',
  startDate: '2026-06-01',
  endDate: '2026-06-03',
  startDayType: 'FULL',
  endDayType: 'NONE', // 0 vacation days on Wednesday
};
const cost7 = calculateTripVacationCost(tripReturnEarly, dummyProfile);
// Mo: 1, Di: 1, Mi: 0 -> Total = 2.0
assert(cost7 === 2.0, `Expected 2.0 days for return before work, got ${cost7}`);

console.log('\n--- TEST 8: Illness Override inside Carry-over in getProfileStatsForYear ---');
// In 2025: 3-day trip (Mon-Wed), but Tuesday had sick entry
const trip2025Sick: Trip = {
  ...tripFrMoFeierabend,
  id: 'trip-2025-sick',
  startDate: '2025-06-02', // Monday
  endDate: '2025-06-04',   // Wednesday
  startDayType: 'FULL',
  endDayType: 'FULL',
};
const entries2025Sick: CalendarEntry[] = [
  {
    id: 'entry-sick-2025',
    profileId: 'user-1',
    date: '2025-06-03', // Tuesday sick
    type: '3',
  },
];
// 30 available - (3 days trip - 1 sick = 2 days used) = 28 carryover into 2026
const stats2026WithSick = getProfileStatsForYear(profileMultiYear, 2026, [], entries2025Sick, [trip2025Sick]);
assert(stats2026WithSick !== null, 'Stats should not be null');
assert(stats2026WithSick!.remainingLeave === 28.0, `Expected carryover 28.0, got ${stats2026WithSick?.remainingLeave}`);

console.log('\n🎉 ALL 8 TRIP CALCULATION & INTEGRATION TESTS PASSED PERFECTLY! 🎉\n');
