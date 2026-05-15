<script>
  import { onMount } from "svelte";
  import { listPlayers } from "$services/players.services.js";
  import PlayerRow from "$components/players/PlayerRow.svelte";
  import Spinner from "$components/common/Spinner.svelte";
  import ErrorState from "$components/common/ErrorState.svelte";

  let players = $state([]);
  let total = $state(0);
  let loading = $state(true);
  let error = $state(null);

  // Filter state
  let position = $state(""); // "" | GK | DEF | MID | FWD
  let sortBy = $state("marketValue"); // marketValue | averagePoints | totalPoints | name
  let sortDir = $state("desc"); // asc | desc
  let minMarketValue = $state("");
  let maxMarketValue = $state("");
  let minAveragePoints = $state("");
  let limit = $state(100);

  let debounceTimer;

  $effect(() => {
    // re-fetch when any filter changes (small debounce so typing numbers feels nice)
    const filters = buildFilters();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => load(filters), 200);
  });

  function buildFilters() {
    return {
      position: position || undefined,
      sortBy,
      sortDir,
      minMarketValue: minMarketValue !== "" ? Number(minMarketValue) : undefined,
      maxMarketValue: maxMarketValue !== "" ? Number(maxMarketValue) : undefined,
      minAveragePoints: minAveragePoints !== "" ? Number(minAveragePoints) : undefined,
      limit
    };
  }

  async function load(filters) {
    loading = true;
    error = null;
    try {
      const data = await listPlayers(filters);
      players = data.players ?? [];
      total = data.total ?? 0;
    } catch (err) {
      error = err;
    } finally {
      loading = false;
    }
  }

  onMount(() => load(buildFilters()));

  const positionOptions = [
    { value: "", label: "Alle Positionen" },
    { value: "GK", label: "Tor" },
    { value: "DEF", label: "Abwehr" },
    { value: "MID", label: "Mittelfeld" },
    { value: "FWD", label: "Sturm" }
  ];

  function reset() {
    position = "";
    sortBy = "marketValue";
    sortDir = "desc";
    minMarketValue = "";
    maxMarketValue = "";
    minAveragePoints = "";
    limit = 100;
  }
</script>

<div class="flex flex-col gap-4">
  <header class="flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 class="text-xl font-semibold text-slate-900">Spieler-Übersicht</h1>
      <p class="text-sm text-slate-500">
        Alle Bundesliga-Spieler aus deinem nächtlichen Kickbase-Snapshot
      </p>
    </div>
    <button
      type="button"
      class="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
      onclick={reset}
    >
      Filter zurücksetzen
    </button>
  </header>

  <!-- Filter row -->
  <div class="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-6">
    <label class="flex flex-col gap-1 text-sm">
      <span class="font-medium text-slate-700">Position</span>
      <select bind:value={position} class="rounded-md border border-slate-300 px-2 py-1.5">
        {#each positionOptions as opt (opt.value)}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
    </label>

    <label class="flex flex-col gap-1 text-sm">
      <span class="font-medium text-slate-700">Sortieren nach</span>
      <select bind:value={sortBy} class="rounded-md border border-slate-300 px-2 py-1.5">
        <option value="marketValue">Marktwert</option>
        <option value="averagePoints">Ø-Punkte</option>
        <option value="totalPoints">Gesamtpunkte</option>
        <option value="name">Name</option>
      </select>
    </label>

    <label class="flex flex-col gap-1 text-sm">
      <span class="font-medium text-slate-700">Reihenfolge</span>
      <select bind:value={sortDir} class="rounded-md border border-slate-300 px-2 py-1.5">
        <option value="desc">Absteigend</option>
        <option value="asc">Aufsteigend</option>
      </select>
    </label>

    <label class="flex flex-col gap-1 text-sm">
      <span class="font-medium text-slate-700">Min. Marktwert (€)</span>
      <input
        type="number"
        bind:value={minMarketValue}
        min="0"
        step="100000"
        placeholder="z.B. 1000000"
        class="rounded-md border border-slate-300 px-2 py-1.5"
      />
    </label>

    <label class="flex flex-col gap-1 text-sm">
      <span class="font-medium text-slate-700">Max. Marktwert (€)</span>
      <input
        type="number"
        bind:value={maxMarketValue}
        min="0"
        step="100000"
        placeholder="z.B. 50000000"
        class="rounded-md border border-slate-300 px-2 py-1.5"
      />
    </label>

    <label class="flex flex-col gap-1 text-sm">
      <span class="font-medium text-slate-700">Min. Ø-Punkte</span>
      <input
        type="number"
        bind:value={minAveragePoints}
        min="0"
        step="10"
        placeholder="z.B. 100"
        class="rounded-md border border-slate-300 px-2 py-1.5"
      />
    </label>
  </div>

  <!-- Result count + list -->
  {#if loading}
    <Spinner label="Lade Spieler …" />
  {:else if error}
    <ErrorState message={error?.message} onRetry={() => load(buildFilters())} />
  {:else if players.length === 0}
    <p class="rounded-md border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
      Keine Spieler passen zu deinen Filtern.
    </p>
  {:else}
    <div class="flex items-center justify-between text-sm text-slate-500">
      <span>{players.length} von {total} Spielern</span>
      <label class="flex items-center gap-2">
        Anzeigen:
        <select bind:value={limit} class="rounded-md border border-slate-300 px-2 py-1">
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={250}>250</option>
          <option value={500}>500</option>
        </select>
      </label>
    </div>

    <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
          <tr>
            <th class="px-3 py-2 w-12"></th>
            <th class="px-3 py-2">Spieler / Verein</th>
            <th class="px-3 py-2 text-center w-16">Pos.</th>
            <th class="px-3 py-2 text-right">Marktwert</th>
            <th class="px-3 py-2 text-right">Ø-Punkte</th>
            <th class="px-3 py-2 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {#each players as p (p.playerId)}
            <PlayerRow player={p} />
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
