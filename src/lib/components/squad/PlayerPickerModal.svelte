<script>
  import { getAlternatives } from "$services/squad.services.js";

  /**
   * Modal that lists replacement candidates for a single position. Fetches
   * top-N alternatives within an optional market-value cap, lets the user
   * pick one, then closes via `onpick(replacement)`.
   *
   * @prop open - boolean — show/hide the modal
   * @prop slot - { player, position } currently being edited (player can be null for empty slots)
   * @prop maxBudget - max market value per candidate (€)
   * @prop excludePlayerIds - already-on-pitch players to filter out
   * @prop riskProfile - current strategy (conservative/balanced/bold)
   * @prop matchday - current matchday number
   * @prop onpick - callback when user selects a replacement
   * @prop onclose - callback when user dismisses without picking
   */
  let {
    open = false,
    slot = null,
    maxBudget,
    excludePlayerIds = [],
    riskProfile = "balanced",
    matchday,
    onpick,
    onclose
  } = $props();

  let alternatives = $state([]);
  let loading = $state(false);
  let error = $state(null);

  const eurFmt = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  });

  $effect(() => {
    if (open && slot?.position) void load();
  });

  async function load() {
    loading = true;
    error = null;
    alternatives = [];
    try {
      const r = await getAlternatives({
        position: slot.position,
        maxBudget,
        excludePlayerIds,
        riskProfile,
        matchday,
        limit: 25
      });
      alternatives = r.alternatives ?? [];
    } catch (err) {
      error = err;
    } finally {
      loading = false;
    }
  }

  function pick(p) {
    onpick?.(p);
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
    role="dialog"
    aria-modal="true"
  >
    <button
      type="button"
      class="absolute inset-0 z-0 cursor-default border-0 bg-transparent"
      aria-label="Schliessen"
      onclick={() => onclose?.()}
    ></button>

    <div class="relative z-10 flex h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:h-auto sm:max-h-[80vh] sm:rounded-2xl">
      <header class="flex items-center justify-between border-b border-slate-200 p-4">
        <div>
          <h2 class="text-base font-semibold text-slate-900">
            {slot?.player?.name ?? "Spieler"} ersetzen
          </h2>
          <p class="text-xs text-slate-500">
            {slot?.position}
            {#if Number.isFinite(maxBudget)}
              · max <span class="font-mono">{eurFmt.format(maxBudget)}</span>
            {/if}
          </p>
        </div>
        <button
          type="button"
          class="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
          onclick={() => onclose?.()}
        >
          ✕
        </button>
      </header>

      <div class="flex-1 overflow-y-auto p-3">
        {#if loading}
          <p class="text-center text-sm text-slate-500">Lade Alternativen …</p>
        {:else if error}
          <p class="text-center text-sm text-red-600">{error.message ?? "Fehler"}</p>
        {:else if alternatives.length === 0}
          <p class="rounded-md border border-amber-200 bg-amber-50 p-3 text-center text-sm text-amber-700">
            Keine Spieler gefunden, die ins Budget passen.
          </p>
        {:else}
          <ul class="flex flex-col gap-1.5">
            {#each alternatives as p (p.playerId)}
              <li>
                <button
                  type="button"
                  onclick={() => pick(p)}
                  class="flex w-full items-center gap-3 rounded-md border border-slate-100 bg-white p-2 text-left transition hover:border-slate-300 hover:bg-slate-50"
                >
                  {#if p.imageUrl}
                    <img
                      src="https://kickbase.b-cdn.net/{p.imageUrl}"
                      alt={p.name}
                      class="size-10 rounded-full bg-slate-100 object-cover"
                    />
                  {:else}
                    <div class="flex size-10 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-500">
                      {p.name?.slice(0, 2) ?? "?"}
                    </div>
                  {/if}
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-sm font-medium text-slate-900">{p.name}</div>
                    <div class="text-[10px] text-slate-500">
                      {p.teamName ?? p.teamId} · {p.position}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-mono text-sm font-semibold tabular-nums text-slate-900">
                      {Math.round(p.expectedPoints ?? 0)} pts
                    </div>
                    <div class="font-mono text-[10px] tabular-nums text-slate-500">
                      {eurFmt.format(p.marketValue ?? 0)}
                    </div>
                  </div>
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  </div>
{/if}
