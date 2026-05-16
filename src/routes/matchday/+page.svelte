<script>
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import ErrorState from "$components/common/ErrorState.svelte";
import Spinner from "$components/common/Spinner.svelte";
import { getCurrentMatchday } from "$services/matchday.services.js";

let error = $state(null);

onMount(async () => {
  try {
    const { matchday } = await getCurrentMatchday();
    await goto(`/matchday/${matchday}`, { replaceState: true });
  } catch (err) {
    error = err;
  }
});
</script>

<svelte:head>
  <title>Kickwise · Spieltag</title>
</svelte:head>

{#if error}
  <ErrorState
    title="Aktueller Spieltag nicht ladbar"
    message={error?.message}
    onRetry={() => location.reload()}
  />
{:else}
  <div class="flex min-h-[40vh] items-center justify-center">
    <Spinner label="Lade aktuellen Spieltag …" />
  </div>
{/if}
