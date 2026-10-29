// Seasonal parties (Phase 13, DESIGN_PROMPT_2.md Part 10): for a few weeks a
// year the Plaza and the Market street get decorations, falling petals and a
// free gift. The dates and decorations are in world/parties.json. A teacher
// (or a test) can show one any day with ?party=<id>, or none with ?party=none.

const monthDay = (date) => `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// The party on `date`, or null. `override` is the ?party= value, if any.
export function activeParty(parties, date = new Date(), override = null) {
  if (override === 'none') return null;
  if (override) return parties.find((p) => p.id === override) ?? null;
  const today = monthDay(date);
  return parties.find((p) => (p.start <= p.end ? today >= p.start && today <= p.end : today >= p.start || today <= p.end)) ?? null;
}

// Returns the rooms with the party's decorations added (a copy; the room
// files are not changed).
export function decorateRooms(rooms, party) {
  if (!party) return rooms;
  const out = { ...rooms };
  for (const [id, extra] of Object.entries(party.decorations)) {
    if (out[id]) out[id] = { ...out[id], decorations: [...out[id].decorations, ...extra] };
  }
  return out;
}

export const isPartyRoom = (party, roomId) => Boolean(party?.decorations[roomId]);
