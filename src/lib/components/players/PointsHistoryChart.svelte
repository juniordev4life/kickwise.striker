<script>
  import { onDestroy } from "svelte";
  import { Chart } from "chart.js/auto";

  // performance: { seasons: [{ seasonId, title, isCurrent, matchdays: [...] }] }
  let { performance } = $props();

  const seasons = $derived(performance?.seasons ?? []);

  let selectedSeasonId = $state(null);
  const selectedSeason = $derived.by(() => {
    if (!seasons.length) return null;
    if (selectedSeasonId) return seasons.find((s) => s.seasonId === selectedSeasonId) ?? null;
    return seasons.find((s) => s.isCurrent) ?? seasons.at(-1);
  });

  // Initialize selection once seasons load
  $effect(() => {
    if (!selectedSeasonId && seasons.length) {
      const current = seasons.find((s) => s.isCurrent) ?? seasons.at(-1);
      selectedSeasonId = current.seasonId;
    }
  });

  let canvasEl;
  let chart;

  function barColor(md) {
    if (md.isUpcoming) return "rgba(203, 213, 225, 0.5)";
    if (!md.hasPlayed) return "rgba(148, 163, 184, 0.6)";
    if (md.goals > 0) return "rgba(132, 204, 22, 0.95)";
    if (md.points >= 100) return "rgba(15, 110, 58, 0.9)";
    if (md.points >= 60) return "rgba(245, 158, 11, 0.9)";
    return "rgba(148, 163, 184, 0.85)";
  }

  function formatMatch(md) {
    const t1g = md.homeGoals ?? "—";
    const t2g = md.awayGoals ?? "—";
    return `${t1g}:${t2g}`;
  }

  function formatActions(md) {
    const parts = [];
    if (md.goals > 0) parts.push(`⚽ ${md.goals}`);
    if (md.assists > 0) parts.push(`🅰 ${md.assists}`);
    if (md.yellowCards > 0) parts.push(`🟨 ${md.yellowCards}`);
    if (md.redCards > 0) parts.push(`🟥 ${md.redCards}`);
    return parts.join("  ");
  }

  $effect(() => {
    if (!canvasEl || !selectedSeason) return;
    chart?.destroy();

    const mds = selectedSeason.matchdays;
    const labels = mds.map((m) => `${m.matchday}.`);
    const points = mds.map((m) => (m.hasPlayed ? m.points : 0));
    const colors = mds.map(barColor);

    chart = new Chart(canvasEl, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Punkte",
            data: points,
            backgroundColor: colors,
            borderRadius: 3,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            padding: 10,
            titleFont: { weight: 600, size: 13 },
            bodyFont: { size: 12 },
            displayColors: false,
            callbacks: {
              title: (items) => {
                const m = mds[items[0].dataIndex];
                return `Spieltag ${m.matchday} · ${formatMatch(m)}`;
              },
              label: (item) => {
                const m = mds[item.dataIndex];
                if (m.isUpcoming) return "Kommendes Spiel";
                if (!m.hasPlayed) return "Nicht gespielt";
                const lines = [`${m.points} Punkte · ${m.minutesPlayed ?? ""}`];
                const actions = formatActions(m);
                if (actions) lines.push(actions);
                return lines;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: "#64748b",
              font: { size: 10 },
              autoSkip: true,
              maxRotation: 0,
              autoSkipPadding: 4
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: "#e2e8f0" },
            ticks: { color: "#94a3b8", font: { size: 10 } }
          }
        }
      }
    });
  });

  onDestroy(() => chart?.destroy());
</script>

{#if !seasons.length}
  <p class="rounded-md bg-slate-50 p-4 text-center text-sm text-slate-500">
    Noch keine Performance-Daten.
  </p>
{:else}
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap gap-1">
      {#each seasons as season (season.seasonId)}
        <button
          type="button"
          onclick={() => (selectedSeasonId = season.seasonId)}
          class="rounded-md px-3 py-1 text-xs font-medium transition"
          class:bg-slate-900={selectedSeason?.seasonId === season.seasonId}
          class:text-white={selectedSeason?.seasonId === season.seasonId}
          class:bg-slate-100={selectedSeason?.seasonId !== season.seasonId}
          class:text-slate-700={selectedSeason?.seasonId !== season.seasonId}
        >
          {season.title}
          {#if season.isCurrent}
            <span class="ml-1 text-[10px] opacity-70">aktuell</span>
          {/if}
        </button>
      {/each}
    </div>

    <div class="relative h-72 w-full">
      <canvas bind:this={canvasEl}></canvas>
    </div>

    {#if selectedSeason}
      {@const played = selectedSeason.matchdays.filter((m) => m.hasPlayed)}
      {@const goals = played.reduce((s, m) => s + m.goals, 0)}
      {@const assists = played.reduce((s, m) => s + m.assists, 0)}
      {@const totalPts = played.reduce((s, m) => s + m.points, 0)}
      {@const avgPts = played.length ? Math.round(totalPts / played.length) : 0}
      <div class="flex flex-wrap gap-4 rounded-md bg-slate-50 p-3 text-xs text-slate-600">
        <div><span class="font-semibold text-slate-900">{played.length}</span> Spiele</div>
        <div>⚽ <span class="font-semibold text-slate-900">{goals}</span></div>
        <div>🅰 <span class="font-semibold text-slate-900">{assists}</span></div>
        <div>Ø <span class="font-semibold text-slate-900">{avgPts}</span> Punkte</div>
        <div>Σ <span class="font-semibold text-slate-900">{totalPts}</span></div>
      </div>
    {/if}
  </div>
{/if}
