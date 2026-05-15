<script>
  import { onDestroy } from "svelte";
  import { Chart } from "chart.js/auto";

  let { history = [] } = $props();

  let canvasEl;
  let chart;

  $effect(() => {
    if (!canvasEl) return;
    chart?.destroy();

    const labels = history.map((d) => `${d.matchday}.`);
    const data = history.map((d) => d.points);
    const backgroundColors = history.map((d) =>
      d.hasPlayed ? "rgba(15, 110, 58, 0.85)" : "rgba(203, 213, 225, 0.85)"
    );

    chart = new Chart(canvasEl, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Punkte",
            data,
            backgroundColor: backgroundColors,
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
            callbacks: {
              title: (items) => `Spieltag ${items[0].label.replace(".", "")}`,
              label: (item) => {
                const d = history[item.dataIndex];
                const pts = `${d.points} Punkte`;
                return d.hasPlayed ? pts : `${pts} (nicht gespielt)`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#64748b", font: { size: 10 }, autoSkip: true, maxRotation: 0 }
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

{#if history.length === 0}
  <p class="rounded-md bg-slate-50 p-4 text-center text-sm text-slate-500">
    Keine Spieltagspunkte verfügbar.
  </p>
{:else}
  <div class="relative h-64 w-full">
    <canvas bind:this={canvasEl}></canvas>
  </div>
{/if}
