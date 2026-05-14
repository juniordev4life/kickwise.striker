<script>
import { goto } from "$app/navigation";
import { page } from "$app/state";
import ErrorState from "$components/common/ErrorState.svelte";
import Spinner from "$components/common/Spinner.svelte";
import MatchCard from "$components/match/MatchCard.svelte";
import MatchdayHeader from "$components/match/MatchdayHeader.svelte";
import { getMatchday } from "$services/matchday.services.js";

const matchdayParam = $derived(Number.parseInt(page.params.matchday ?? "1", 10));

let season = $state("");
let matchday = $state(matchdayParam);
let matches = $state([]);
let loading = $state(true);
let error = $state(null);

$effect(() => {
  load(matchdayParam);
});

async function load(md) {
  loading = true;
  error = null;
  try {
    const result = await getMatchday(md);
    season = result.season;
    matchday = result.matchday;
    matches = result.matches ?? [];
  } catch (err) {
    error = err;
  } finally {
    loading = false;
  }
}

function prev() {
  if (matchday > 1) goto(`/matchday/${matchday - 1}`);
}
function next() {
  if (matchday < 34) goto(`/matchday/${matchday + 1}`);
}
</script>

<div class="flex flex-col gap-4">
  <MatchdayHeader {season} {matchday} onPrev={prev} onNext={next} />

  {#if loading}
    <Spinner label="Lade Spieltag …" />
  {:else if error}
    <ErrorState message={error?.message} onRetry={() => load(matchday)} />
  {:else if matches.length === 0}
    <p class="rounded-md border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
      Keine Spiele für diesen Spieltag — vielleicht hat der Scout noch nicht gelaufen.
    </p>
  {:else}
    <ul class="flex flex-col gap-2">
      {#each matches as match (match.match_id)}
        <li>
          <MatchCard {match} />
        </li>
      {/each}
    </ul>
  {/if}
</div>
