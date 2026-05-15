<script>
  import { onDestroy } from "svelte";
  import { Chart } from "chart.js/auto";

  let { history = [] } = $props();

  let canvasEl;
  let chart;

  const fullFmt = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  });
  const compactFmt = new Intl.NumberFormat("de-DE", {
    notation: "compact",
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 1
  });
  const dateFmt = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short"
  });

  $effect(() => {
    if (!canvasEl) return;
    chart?.destroy();

    const labels = history.map((d) => {
      const date = new Date(d.date);
      return Number.isNaN(date.getTime()) ? d.date : dateFmt.format(date);
    });
    const data = history.map((d) => d.marketValue ?? 0);

    chart = new Chart(canvasEl, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Marktwert",
            data,
            borderColor: "rgba(15, 110, 58, 1)",
            backgroundColor: "rgba(15, 110, 58, 0.12)",
            fill: true,
            tension: 0.25,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: "rgba(15, 110, 58, 1)"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: "index" },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => items[0].label,
              label: (item) => {
                const d = history[item.dataIndex];
                const v = fullFmt.format(d.marketValue ?? 0);
                if (d.delta24h === null || d.delta24h === undefined) return v;
                const sign = d.delta24h > 0 ? "+" : d.delta24h < 0 ? "−" : "±";
                const trend = fullFmt.format(Math.abs(d.delta24h));
                return `${v} (${sign}${trend} 24h)`;
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
            grid: { color: "#e2e8f0" },
            ticks: {
              color: "#94a3b8",
              font: { size: 10 },
              callback: (value) => compactFmt.format(value)
            }
          }
        }
      }
    });
  });

  onDestroy(() => chart?.destroy());
</script>

{#if history.length === 0}
  <p class="rounded-md bg-slate-50 p-4 text-center text-sm text-slate-500">
    Noch keine Marktwert-Historie. Der Scout-Snapshot baut sie täglich auf.
  </p>
{:else}
  <div class="relative h-64 w-full">
    <canvas bind:this={canvasEl}></canvas>
  </div>
{/if}
