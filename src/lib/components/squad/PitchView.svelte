<script>
  import PlayerSpot from "./PlayerSpot.svelte";

  /**
   * Renders an XI on a football pitch background, grouped by row (FWD top,
   * MID, DEF, GK bottom). Highlights the captain.
   *
   * @prop lineup - array of player objects (from /squad/lineup)
   * @prop captain - { playerId, name } or null
   * @prop formation - "4-4-2" etc, used to lay out empty slots if lineup is short
   */
  let { lineup = [], captain = null, formation = "4-4-2" } = $props();

  const grouped = $derived.by(() => {
    const out = { GK: [], DEF: [], MID: [], FWD: [] };
    for (const p of lineup) {
      if (out[p.position]) out[p.position].push(p);
    }
    return out;
  });

  const formationCounts = $derived.by(() => {
    const [d, m, f] = formation.split("-").map(Number);
    return { DEF: d, MID: m, FWD: f };
  });

  const captainId = $derived(captain?.playerId ? String(captain.playerId) : null);

  // Pad each row to the formation size with nulls (empty placeholders)
  function rowOf(position) {
    const players = grouped[position] ?? [];
    const expected = position === "GK" ? 1 : formationCounts[position] ?? players.length;
    const out = [...players];
    while (out.length < expected) out.push(null);
    return out.slice(0, expected);
  }

  const rows = $derived({
    FWD: rowOf("FWD"),
    MID: rowOf("MID"),
    DEF: rowOf("DEF"),
    GK: rowOf("GK")
  });

  function isCaptain(player) {
    return player && captainId && String(player.playerId) === captainId;
  }
</script>

<div class="relative overflow-hidden rounded-2xl bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-800 p-4 shadow-lg">
  <!-- Pitch markings (decorative) -->
  <div class="pointer-events-none absolute inset-2 rounded-xl border border-white/30"></div>
  <div class="pointer-events-none absolute left-1/2 top-2 h-[calc(100%-1rem)] w-px -translate-x-1/2 bg-white/20"></div>
  <div class="pointer-events-none absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30"></div>

  <!-- Pitch rows (attacking top, GK bottom) -->
  <div class="relative flex flex-col gap-5 py-4">
    {#each ["FWD", "MID", "DEF", "GK"] as position (position)}
      <div class="flex flex-wrap items-center justify-around gap-2">
        {#each rows[position] as player, i (i + position)}
          <PlayerSpot {player} isCaptain={isCaptain(player)} />
        {/each}
      </div>
    {/each}
  </div>
</div>
