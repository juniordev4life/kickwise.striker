<script>
  /**
   * Compact captain-pick widget. Shows the top-3 captain candidates from
   * the user's squad for a given matchday with their expected points.
   *
   * @prop candidates - array from /squad/:leagueId/captain-candidates
   * @prop matchday - current matchday number (for the header)
   */
  let { candidates = [], matchday = null } = $props();

  function fmtPoints(v) {
    return Math.round(v ?? 0);
  }

  function shortName(name) {
    if (!name) return "";
    if (name.length <= 18) return name;
    const parts = name.split(" ");
    return parts.length > 1 ? parts[parts.length - 1] : `${name.slice(0, 16)}…`;
  }
</script>

{#if candidates?.length}
  <section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <header class="mb-3 flex items-center justify-between">
      <h2 class="text-sm font-semibold text-slate-900">Captain-Tipp</h2>
      {#if matchday}
        <span class="text-xs text-slate-500">Spieltag {matchday}</span>
      {/if}
    </header>

    <ol class="flex flex-col gap-2">
      {#each candidates as c, i (c.playerId)}
        <li class="flex items-center justify-between gap-2 rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
          <div class="flex items-center gap-2">
            <span class="flex size-6 items-center justify-center rounded-full {i === 0 ? 'bg-amber-400 text-white' : 'bg-slate-300 text-slate-700'} text-xs font-bold">
              {i + 1}
            </span>
            {#if c.imageUrl}
              <img
                src="https://kickbase.b-cdn.net/{c.imageUrl}"
                alt={c.name}
                class="size-8 rounded-full bg-slate-100 object-cover"
              />
            {/if}
            <div class="min-w-0">
              <div class="truncate text-sm font-medium text-slate-900">{shortName(c.name)}</div>
              <div class="text-[10px] text-slate-500">
                {c.position}
                {#if c.isHome !== null && c.opponentTeamId}
                  · {c.isHome ? "vs" : "@"} {c.opponentTeamId}
                {/if}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-mono text-sm font-semibold tabular-nums text-slate-900">
              {fmtPoints(c.expectedPoints)}
            </div>
            <div class="text-[10px] uppercase tracking-wide text-amber-600">×2 = {fmtPoints(c.expectedPoints * 2)}</div>
          </div>
        </li>
      {/each}
    </ol>

    <p class="mt-2 text-center text-[10px] text-slate-400">
      Captain bekommt die doppelte Punktzahl. Tipp #1 = höchste erwartete Punkte.
    </p>
  </section>
{/if}
