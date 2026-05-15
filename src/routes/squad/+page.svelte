<script>
import { onMount } from "svelte";
import ErrorState from "$components/common/ErrorState.svelte";
import Spinner from "$components/common/Spinner.svelte";
import PitchView from "$components/squad/PitchView.svelte";
import PlayerCard from "$components/squad/PlayerCard.svelte";
import PlayerPickerModal from "$components/squad/PlayerPickerModal.svelte";
import { getMyLeagues } from "$services/league.services.js";
import {
  getBudgetLineup,
  getMySquad,
  getOptimizedLineup,
  submitLineup
} from "$services/squad.services.js";

const FORMATIONS = ["auto", "3-4-3", "3-5-2", "4-3-3", "4-4-2", "4-5-1", "5-3-2", "5-4-1"];
const RISK_PROFILES = [
  { key: "conservative", label: "Konservativ", description: "Nur Stammspieler aus klaren Favoriten" },
  { key: "balanced", label: "Normal", description: "Standard — maximal erwartete Punkte" },
  { key: "bold", label: "Mutig", description: "Rotationsspieler erlaubt, Captain mit Ceiling" }
];

let leagues = $state([]);
let selectedLeagueId = $state(null);
let squad = $state(null);
let optimized = $state(null);
let manualLineup = $state(null); // user-edited overrides; null = use optimized.lineup
let formation = $state("auto");
let pool = $state("squad"); // "squad" | "budget"
let riskProfile = $state("balanced");
let budgetInputM = $state(150); // millions
let view = $state("pitch"); // "pitch" | "list"
let loading = $state(true);
let optimizing = $state(false);
let error = $state(null);

let pickerOpen = $state(false);
let pickerSlot = $state(null); // { player, position }
let pickerMaxBudget = $state(null);

let submitting = $state(false);
let submitStatus = $state(null); // { kind: "success" | "error", message: string } | null

// What's actually rendered on the pitch — user edits take priority.
const displayLineup = $derived(manualLineup ?? optimized?.lineup ?? []);

const displayCaptain = $derived.by(() => {
  if (!displayLineup.length) return optimized?.captain ?? null;
  const top = displayLineup.reduce(
    (b, p) => ((p.expectedPoints ?? 0) > (b?.expectedPoints ?? -1) ? p : b),
    null
  );
  return top ? { playerId: top.playerId, name: top.name } : null;
});

const displayTotalMarketValue = $derived(
  displayLineup.reduce((s, p) => s + (Number(p.marketValue) || 0), 0)
);

const displayTotalExpected = $derived.by(() => {
  const sum = displayLineup.reduce((s, p) => s + (p.expectedPoints ?? 0), 0);
  const cap = displayCaptain
    ? displayLineup.find((p) => p.playerId === displayCaptain.playerId)
    : null;
  return sum + (cap?.expectedPoints ?? 0); // captain doubles
});

// Budget is always active — in budget mode it caps the auto-XI, in squad
// mode it constrains manual swaps (the user's Kickbase cash on hand).
const totalBudgetEur = $derived(Math.round(budgetInputM * 1_000_000));

const eurFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0
});

const grouped = $derived.by(() => {
  if (!squad?.players) return {};
  const buckets = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const player of squad.players) {
    (buckets[player.position] ?? (buckets[player.position] = [])).push(player);
  }
  return buckets;
});

const groupLabels = { GK: "Tor", DEF: "Abwehr", MID: "Mittelfeld", FWD: "Sturm" };

onMount(async () => {
  try {
    const result = await getMyLeagues();
    leagues = result.leagues ?? [];
    if (leagues.length > 0) {
      selectedLeagueId = leagues[0].id;
    } else {
      loading = false;
    }
  } catch (err) {
    error = err;
    loading = false;
  }
});

$effect(() => {
  if (selectedLeagueId) {
    void loadSquad(selectedLeagueId);
  }
});

// Auto-load on pool / league change ONLY if we don't already have a manual
// lineup. Once the user has edited or copied a lineup over, we leave it
// alone — they re-trigger explicit recompute via the "Aufstellung berechnen"
// button.
$effect(() => {
  if (!selectedLeagueId) return;
  if (manualLineup) return;
  if (pool === "squad") {
    void loadOptimizedFromSquad(selectedLeagueId, formation, riskProfile);
  }
});

async function loadSquad(leagueId) {
  loading = true;
  error = null;
  try {
    squad = await getMySquad(leagueId);
  } catch (err) {
    error = err;
  } finally {
    loading = false;
  }
}

async function loadOptimizedFromSquad(leagueId, formationKey, riskProfileKey) {
  optimizing = true;
  try {
    optimized = await getOptimizedLineup(leagueId, {
      formation: formationKey,
      riskProfile: riskProfileKey
    });
    manualLineup = null;
  } catch (err) {
    optimized = null;
    console.warn("Lineup optimizer failed:", err);
  } finally {
    optimizing = false;
  }
}

async function loadOptimizedFromBudget() {
  optimizing = true;
  try {
    optimized = await getBudgetLineup({
      budget: Math.round(budgetInputM * 1_000_000),
      formation,
      riskProfile
    });
    manualLineup = null;
  } catch (err) {
    optimized = null;
    console.warn("Budget optimizer failed:", err);
  } finally {
    optimizing = false;
  }
}

function openPicker(player, position) {
  if (!displayLineup.length) return;
  let maxBudget = null;
  if (totalBudgetEur) {
    // Budget left over if we sell this player: total - (currentTotal - thisPlayer)
    const otherSpent = displayLineup.reduce(
      (s, p) => s + (p.playerId === player?.playerId ? 0 : Number(p.marketValue) || 0),
      0
    );
    maxBudget = totalBudgetEur - otherSpent;
  }
  pickerSlot = { player, position };
  pickerMaxBudget = maxBudget;
  pickerOpen = true;
}

/**
 * Copies the current displayed lineup over to "Mein Kader" pool. Used
 * when the user generated an ideal XI under Bundesliga+Budget and wants
 * to refine it (and eventually submit) in squad mode.
 */
function adoptAsMyKader() {
  if (!displayLineup.length) return;
  const snapshot = displayLineup.map((p) => ({ ...p }));
  pool = "squad";
  manualLineup = snapshot;
  submitStatus = null;
}

function applySwap(replacement) {
  const next = [...displayLineup];
  const idx = next.findIndex((p) => p.playerId === pickerSlot?.player?.playerId);
  if (idx >= 0) {
    next[idx] = { ...replacement, status: replacement.status ?? "fit" };
  } else {
    next.push(replacement);
  }
  manualLineup = next;
  pickerOpen = false;
  pickerSlot = null;
}

function resetManualEdits() {
  manualLineup = null;
}

async function pushLineupToKickbase() {
  if (!selectedLeagueId || !displayLineup.length || !optimized?.formation) return;
  submitting = true;
  submitStatus = null;
  try {
    const payload = {
      formation: optimized.formation,
      players: displayLineup.map((p) => ({
        playerId: String(p.playerId),
        position: p.position
      }))
    };
    await submitLineup(selectedLeagueId, payload);
    submitStatus = {
      kind: "success",
      message: "Aufstellung in Kickbase übernommen."
    };
  } catch (err) {
    submitStatus = {
      kind: "error",
      message: err?.message ?? "Konnte Aufstellung nicht senden."
    };
  } finally {
    submitting = false;
  }
}

const excludePickerIds = $derived(displayLineup.map((p) => String(p.playerId)));
</script>

<div class="flex flex-col gap-4">
  <header class="flex flex-wrap items-center justify-between gap-3">
    <h1 class="text-xl font-semibold text-slate-900">Mein Kader</h1>

    <div class="flex flex-wrap items-center gap-2 text-sm">
      {#if leagues.length > 1}
        <label class="flex items-center gap-1 text-slate-500">
          Liga
          <select
            class="rounded-md border border-slate-300 bg-white px-2 py-1.5"
            bind:value={selectedLeagueId}
          >
            {#each leagues as league (league.id)}
              <option value={league.id}>{league.name}</option>
            {/each}
          </select>
        </label>
      {/if}

      <label class="flex items-center gap-1 text-slate-500">
        Pool
        <select
          class="rounded-md border border-slate-300 bg-white px-2 py-1.5"
          bind:value={pool}
        >
          <option value="squad">Mein Kader</option>
          <option value="budget">Bundesliga + Budget</option>
        </select>
      </label>

      <label class="flex items-center gap-1 text-slate-500">
        Strategie
        <select
          class="rounded-md border border-slate-300 bg-white px-2 py-1.5"
          bind:value={riskProfile}
        >
          {#each RISK_PROFILES as r (r.key)}
            <option value={r.key}>{r.label}</option>
          {/each}
        </select>
      </label>

      <label class="flex items-center gap-1 text-slate-500">
        Formation
        <select
          class="rounded-md border border-slate-300 bg-white px-2 py-1.5"
          bind:value={formation}
        >
          {#each FORMATIONS as f (f)}
            <option value={f}>{f === "auto" ? "Auto (beste)" : f}</option>
          {/each}
        </select>
      </label>

      <div class="ml-1 inline-flex overflow-hidden rounded-md border border-slate-300 bg-white text-xs">
        <button
          class="px-2 py-1 {view === 'pitch' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}"
          onclick={() => (view = "pitch")}
        >
          Aufstellung
        </button>
        <button
          class="px-2 py-1 {view === 'list' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}"
          onclick={() => (view = "list")}
        >
          Liste
        </button>
      </div>
    </div>
  </header>

  {#if loading}
    <Spinner label="Lade Kader …" />
  {:else if error}
    <ErrorState message={error?.message} onRetry={() => loadSquad(selectedLeagueId)} />
  {:else if !squad}
    <p class="rounded-md border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
      Kein Kader gefunden.
    </p>
  {:else if view === "pitch"}
    <section class="flex flex-col gap-3">
      <div class="flex flex-wrap items-end gap-2 rounded-md border border-slate-200 bg-white p-3">
        <label class="flex flex-col text-xs text-slate-500">
          Budget (Mio. €)
          <input
            type="number"
            min="10"
            max="1000"
            step="5"
            class="mt-1 w-32 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-mono"
            bind:value={budgetInputM}
          />
        </label>
        {#if pool === "budget"}
          <button
            class="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            disabled={optimizing}
            onclick={loadOptimizedFromBudget}
          >
            {optimizing ? "Berechne …" : "Aufstellung berechnen"}
          </button>
          {#if displayLineup.length === 11}
            <button
              type="button"
              class="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
              onclick={adoptAsMyKader}
            >
              Als Vorschlag übernehmen
            </button>
          {/if}
        {:else}
          <button
            class="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            disabled={optimizing || !selectedLeagueId}
            onclick={() => {
              manualLineup = null;
              loadOptimizedFromSquad(selectedLeagueId, formation, riskProfile);
            }}
          >
            {optimizing ? "Berechne …" : "Neu berechnen"}
          </button>
        {/if}
        <p class="ml-auto text-xs text-slate-500">
          Verbraucht: <span class="font-mono">{eurFormatter.format(displayTotalMarketValue)}</span>
          <span class="ml-1 {totalBudgetEur - displayTotalMarketValue < 0 ? 'text-red-600' : 'text-slate-500'}">
            · {eurFormatter.format(totalBudgetEur - displayTotalMarketValue)} übrig
          </span>
        </p>
      </div>

      {#if optimizing}
        <p class="text-center text-xs text-slate-500">Berechne empfohlene Aufstellung …</p>
      {/if}

      {#if optimized?.lineup?.length}
        <PitchView
          lineup={displayLineup}
          captain={displayCaptain}
          formation={optimized.formation}
          onpickplayer={openPicker}
        />

        {#if manualLineup}
          <div class="flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            <span>Manuell bearbeitet</span>
            <button
              type="button"
              class="rounded-md bg-white px-2 py-1 text-xs font-medium text-blue-900 hover:bg-blue-100"
              onclick={resetManualEdits}
            >
              Auf Empfehlung zurücksetzen
            </button>
          </div>
        {/if}

        {#if optimized.warnings?.length}
          <div class="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
            <div class="mb-1 font-semibold">⚠️ Status-Warnung</div>
            <ul class="flex flex-col gap-0.5">
              {#each optimized.warnings as w (w.playerId)}
                <li>{w.name} – {w.status}</li>
              {/each}
            </ul>
          </div>
        {/if}

        <div class="grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
          <div class="rounded-md border border-slate-200 bg-white p-2">
            <div class="text-slate-500">Spieltag</div>
            <div class="font-semibold text-slate-900">{optimized.matchday}</div>
          </div>
          <div class="rounded-md border border-slate-200 bg-white p-2">
            <div class="text-slate-500">Formation</div>
            <div class="font-semibold text-slate-900">{optimized.formation}</div>
          </div>
          <div class="rounded-md border border-slate-200 bg-white p-2">
            <div class="text-slate-500">Σ erwartet</div>
            <div class="font-semibold text-slate-900">{Math.round(displayTotalExpected)}</div>
          </div>
          <div class="rounded-md border border-slate-200 bg-white p-2">
            <div class="text-slate-500">Captain</div>
            <div class="truncate font-semibold text-slate-900">{displayCaptain?.name ?? "—"}</div>
          </div>
        </div>

        {#if pool === "squad" && selectedLeagueId && displayLineup.length === 11}
          <div class="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-3">
            <button
              type="button"
              class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
              disabled={submitting}
              onclick={pushLineupToKickbase}
            >
              {submitting ? "Sende an Kickbase …" : "In Kickbase übernehmen"}
            </button>
            {#if submitStatus}
              <p
                class="text-xs {submitStatus.kind === 'success' ? 'text-emerald-700' : 'text-red-600'}"
              >
                {submitStatus.message}
              </p>
            {/if}
            <p class="text-[10px] text-slate-400">
              Schreibt die XI direkt in deine Kickbase-Liga. Captain musst du in Kickbase
              manuell setzen — die API liefert dafür keinen Endpoint.
            </p>
          </div>
        {/if}

        {#if optimized.bench?.length}
          <section class="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500">Bank</h3>
            <ul class="flex flex-col gap-2">
              {#each optimized.bench.slice(0, 8) as p (p.playerId)}
                <li class="flex items-center justify-between rounded-md bg-white px-2 py-1 text-sm">
                  <div class="flex items-center gap-2">
                    <span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{p.position}</span>
                    <span class="text-slate-900">{p.name}</span>
                  </div>
                  <span class="font-mono text-xs tabular-nums text-slate-500">
                    {Math.round(p.expectedPoints ?? 0)} pts
                  </span>
                </li>
              {/each}
            </ul>
          </section>
        {/if}
      {:else if !optimizing}
        <p class="rounded-md border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-700">
          Aufstellungs-Optimierer hat noch keine Empfehlung — vermutlich gibt es für diesen
          Spieltag noch keine Predictions. Schaut nochmal nach dem nächsten Refresh (07:00).
        </p>
      {/if}
    </section>
  {:else}
    <div class="flex flex-col gap-6">
      {#each ["GK", "DEF", "MID", "FWD"] as position (position)}
        {#if grouped[position]?.length}
          <section class="flex flex-col gap-2">
            <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {groupLabels[position]}
            </h2>
            <ul class="flex flex-col gap-2">
              {#each grouped[position] as player (player.playerId)}
                <li>
                  <PlayerCard {player} />
                </li>
              {/each}
            </ul>
          </section>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<PlayerPickerModal
  open={pickerOpen}
  slot={pickerSlot}
  maxBudget={pickerMaxBudget}
  excludePlayerIds={excludePickerIds}
  {riskProfile}
  matchday={optimized?.matchday}
  onpick={applySwap}
  onclose={() => {
    pickerOpen = false;
    pickerSlot = null;
  }}
/>
