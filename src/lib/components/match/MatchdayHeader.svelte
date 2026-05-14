<script>
let { season, matchday, onPrev, onNext } = $props();
</script>

<div class="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm">
  <div class="text-sm text-slate-500">
    Saison <span class="font-medium text-slate-700">{season}</span>
  </div>
  <div class="flex items-center gap-2">
    <button
      type="button"
      class="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
      onclick={onPrev}
      disabled={matchday <= 1}
      aria-label="Vorheriger Spieltag"
    >‹</button>
    <span class="font-semibold text-slate-900">{matchday}. Spieltag</span>
    <button
      type="button"
      class="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
      onclick={onNext}
      disabled={matchday >= 34}
      aria-label="Nächster Spieltag"
    >›</button>
  </div>
</div>
