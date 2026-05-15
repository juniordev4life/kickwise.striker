<script>
  import { page } from "$app/state";
  import { getPlayerById, getPlayerPerformance } from "$services/players.services.js";
  import PointsHistoryChart from "$components/players/PointsHistoryChart.svelte";
  import MarketValueChart from "$components/players/MarketValueChart.svelte";
  import Spinner from "$components/common/Spinner.svelte";
  import ErrorState from "$components/common/ErrorState.svelte";

  const playerId = $derived(page.params.playerId);

  let player = $state(null);
  let marketValueHistory = $state([]);
  let performance = $state(null);
  let loading = $state(true);
  let error = $state(null);

  $effect(() => {
    load(playerId);
  });

  async function load(id) {
    loading = true;
    error = null;
    try {
      const [detailRes, perfRes] = await Promise.all([
        getPlayerById(id),
        getPlayerPerformance(id).catch(() => null)
      ]);
      player = detailRes.player;
      marketValueHistory = detailRes.marketValueHistory ?? [];
      performance = perfRes;
    } catch (err) {
      error = err;
    } finally {
      loading = false;
    }
  }

  const imgSrc = $derived(
    player?.imageUrl ? `https://kickbase.b-cdn.net/${player.imageUrl}` : null
  );

  const mvFormatter = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  });

  const statusClass = $derived(
    player?.status === "fit"
      ? "bg-emerald-50 text-emerald-700"
      : player?.status === "injured"
        ? "bg-red-50 text-red-700"
        : player?.status === "questionable"
          ? "bg-amber-50 text-amber-700"
          : "bg-slate-50 text-slate-500"
  );

  const trend = $derived.by(() => {
    const d = player?.marketValueTrend24h;
    if (d === null || d === undefined) return null;
    if (d > 0) return { sym: "▲", cls: "text-emerald-600" };
    if (d < 0) return { sym: "▼", cls: "text-red-600" };
    return { sym: "■", cls: "text-slate-400" };
  });

  const playedMatches = $derived(
    (player?.pointsHistory ?? []).filter((m) => m.hasPlayed).length
  );
</script>

<div class="flex flex-col gap-6">
  <a
    href="/players"
    class="inline-flex w-fit items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
  >
    ← Zurück zur Spieler-Übersicht
  </a>

  {#if loading}
    <Spinner label="Lade Spielerdaten …" />
  {:else if error}
    <ErrorState message={error?.message} onRetry={() => load(playerId)} />
  {:else if !player}
    <p class="rounded-md border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
      Spieler nicht gefunden.
    </p>
  {:else}
    <!-- Header -->
    <header class="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
      {#if imgSrc}
        <img
          src={imgSrc}
          alt={player.name}
          width="96"
          height="96"
          class="size-24 rounded-full bg-slate-100 object-cover"
        />
      {:else}
        <div class="flex size-24 items-center justify-center rounded-full bg-slate-200 text-2xl text-slate-500">
          {player.name?.slice(0, 2) ?? "?"}
        </div>
      {/if}

      <div class="flex flex-1 flex-col gap-1">
        <h1 class="text-2xl font-semibold text-slate-900">
          {player.name}
          {#if player.shirtNumber}
            <span class="ml-1 text-base text-slate-400">#{player.shirtNumber}</span>
          {/if}
        </h1>
        <div class="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <span>{player.teamName ?? "—"}</span>
          <span class="text-slate-300">·</span>
          <span>
            {player.position === "GK"
              ? "Tor"
              : player.position === "DEF"
                ? "Abwehr"
                : player.position === "MID"
                  ? "Mittelfeld"
                  : player.position === "FWD"
                    ? "Sturm"
                    : player.position}
          </span>
          <span class="text-slate-300">·</span>
          <span class="rounded-full px-2 py-0.5 text-xs font-medium {statusClass}">
            {player.status}
          </span>
        </div>
      </div>
    </header>

    <!-- KPI grid -->
    <section class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="text-xs uppercase tracking-wide text-slate-500">Marktwert</div>
        <div class="mt-1 text-lg font-semibold text-slate-900">
          {mvFormatter.format(player.marketValue ?? 0)}
        </div>
        {#if trend}
          <div class="mt-1 text-xs {trend.cls}">
            {trend.sym} {mvFormatter.format(Math.abs(player.marketValueTrend24h))} (24h)
          </div>
        {/if}
      </div>

      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="text-xs uppercase tracking-wide text-slate-500">Ø-Punkte</div>
        <div class="mt-1 text-lg font-semibold text-slate-900">
          {player.averagePoints ?? "—"}
        </div>
        <div class="mt-1 text-xs text-slate-500">pro Spieltag</div>
      </div>

      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="text-xs uppercase tracking-wide text-slate-500">Σ Punkte</div>
        <div class="mt-1 text-lg font-semibold text-slate-900">
          {player.totalPoints ?? "—"}
        </div>
        <div class="mt-1 text-xs text-slate-500">{playedMatches} Spiele</div>
      </div>

      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="text-xs uppercase tracking-wide text-slate-500">Aufstellung</div>
        <div class="mt-1 text-lg font-semibold text-slate-900">
          {player.startingProbability !== null && player.startingProbability !== undefined
            ? `${Math.round(player.startingProbability * 100)}%`
            : "—"}
        </div>
        <div class="mt-1 text-xs text-slate-500">Wahrscheinlichkeit</div>
      </div>
    </section>

    <!-- Stat strip -->
    <section class="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm">
      <div><span class="text-slate-500">Tore:</span> <span class="font-semibold">{player.goals ?? 0}</span></div>
      <div><span class="text-slate-500">Assists:</span> <span class="font-semibold">{player.assists ?? 0}</span></div>
      <div><span class="text-slate-500">Gelbe Karten:</span> <span class="font-semibold">{player.yellowCards ?? 0}</span></div>
      <div><span class="text-slate-500">Rote Karten:</span> <span class="font-semibold">{player.redCards ?? 0}</span></div>
    </section>

    <!-- Points history chart -->
    <section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 class="mb-3 text-base font-semibold text-slate-900">Punkte pro Spieltag</h2>
      <PointsHistoryChart {performance} playerTeamId={player.teamId} />
    </section>

    <!-- Market value chart -->
    <section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 class="mb-3 text-base font-semibold text-slate-900">Marktwert (letzte 30 Tage)</h2>
      <MarketValueChart history={marketValueHistory} />
    </section>
  {/if}
</div>
