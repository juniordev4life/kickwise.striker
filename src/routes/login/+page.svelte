<script>
import { goto } from "$app/navigation";
import Button from "$components/common/Button.svelte";
import Input from "$components/common/Input.svelte";
import { authStore } from "$stores/auth.stores.js";

let email = $state("");
let password = $state("");
let submitting = $state(false);
let errorMessage = $state("");

$effect(() => {
  if (authStore.isAuthenticated) {
    goto("/matchday");
  }
});

async function handleSubmit(event) {
  event.preventDefault();
  submitting = true;
  errorMessage = "";
  try {
    await authStore.login(email, password);
    await goto("/matchday");
  } catch (err) {
    errorMessage =
      err?.status === 401
        ? "E-Mail oder Passwort falsch."
        : (err?.message ?? "Login fehlgeschlagen.");
  } finally {
    submitting = false;
  }
}
</script>

<div class="mx-auto flex max-w-md flex-col gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
  <header class="flex flex-col gap-1">
    <h1 class="text-xl font-semibold text-slate-900">Anmelden</h1>
    <p class="text-sm text-slate-500">
      Mit deinen Kickbase-Zugangsdaten — Kickwise speichert keine Passwörter, sondern nur den
      Kickbase-Token für die Dauer deiner Session.
    </p>
  </header>

  <form class="flex flex-col gap-4" onsubmit={handleSubmit}>
    <Input
      id="email"
      label="E-Mail"
      type="email"
      bind:value={email}
      required
      autocomplete="email"
      placeholder="max@example.com"
    />
    <Input
      id="password"
      label="Passwort"
      type="password"
      bind:value={password}
      required
      autocomplete="current-password"
    />

    {#if errorMessage}
      <p class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
    {/if}

    <Button type="submit" loading={submitting} disabled={!email || !password}>
      Anmelden
    </Button>
  </form>
</div>
