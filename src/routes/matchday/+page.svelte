<script>
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { getCurrentMatchday } from "$services/matchday.services.js";

let loading = $state(true);
let error = $state(null);

onMount(async () => {
  try {
    const { matchday } = await getCurrentMatchday();
    await goto(`/matchday/${matchday}`, { replaceState: true });
  } catch (err) {
    error = err;
    loading = false;
  }
});
</script>

{#if loading}
  <p class="text-center text-sm text-slate-500">Lade aktuellen Spieltag …</p>
{:else if error}
  <p class="text-center text-sm text-red-600">
    Konnte aktuellen Spieltag nicht laden ({error?.message ?? "unbekannter Fehler"}).
  </p>
{/if}
