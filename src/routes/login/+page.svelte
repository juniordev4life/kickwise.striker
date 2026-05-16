<script>
import { goto } from "$app/navigation";
import KickwiseLogo from "$components/common/KickwiseLogo.svelte";
import { authStore } from "$stores/auth.stores.svelte.js";

let email = $state("");
let password = $state("");
let submitting = $state(false);
let errorMessage = $state("");

$effect(() => {
  if (authStore.isAuthenticated) {
    goto("/dashboard");
  }
});

async function handleSubmit(event) {
  event.preventDefault();
  submitting = true;
  errorMessage = "";
  try {
    await authStore.login(email, password);
    await goto("/dashboard");
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

<div class="splash-hero relative min-h-screen overflow-hidden text-white">
  <div class="pattern-dots pointer-events-none absolute inset-0 opacity-50"></div>

  <div class="relative mx-auto grid min-h-screen max-w-6xl gap-12 px-6 py-12 lg:grid-cols-2 lg:items-center lg:py-20">
    <!-- Brand column -->
    <section class="flex flex-col items-start gap-8 text-left">
      <!-- Brand mark -->
      <div class="flex items-center gap-3">
        <KickwiseLogo variant="mark" class="h-11 w-11" />
        <span class="font-display text-xl font-bold tracking-tight">kickwise</span>
      </div>

      <!-- Hero logo on mobile only (centered) -->
      <div class="relative mx-auto flex h-32 w-32 items-center justify-center lg:hidden">
        <div class="absolute inset-2 rounded-full bg-gradient-to-br from-[#23C6D1]/30 via-transparent to-[#113A78]/40 blur-2xl"></div>
        <KickwiseLogo variant="badge" class="relative h-32 w-32 drop-shadow-[0_8px_24px_rgba(35,198,209,0.35)]" />
      </div>

      <div class="space-y-5">
        <h1 class="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          Smarter <span class="text-[#C9A64B]">Kickbase</span>.<br />Bigger wins.
        </h1>
        <p class="max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
          Kickwise blends Poisson-xG predictions with your Kickbase squad to forecast every
          Bundesliga matchday and build the optimal lineup — in one tap.
        </p>
      </div>

      <!-- Feature pills -->
      <div class="hidden w-full max-w-xl grid-cols-3 gap-3 lg:grid">
        <div class="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
          <span
            class="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#23C6D1]/20 text-[#23C6D1]"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </span>
          <div class="text-sm font-semibold">Poisson-xG</div>
          <div class="mt-0.5 text-xs text-white/60">Every fixture scored.</div>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
          <span
            class="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#C9A64B]/25 text-[#C9A64B]"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9.94 13.5L5.5 18l4 1 1 4 4.44-4.5" />
              <path d="M14.5 4.5l5 5L11 18l-5-5z" />
            </svg>
          </span>
          <div class="text-sm font-semibold">Auto-Aufstellung</div>
          <div class="mt-0.5 text-xs text-white/60">Captain &amp; Bank in 1 Tap.</div>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
          <span
            class="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M8 21h8M12 17v4M17 5h3v3a5 5 0 01-5 5h-1M7 5H4v3a5 5 0 005 5h1M7 3h10v6a5 5 0 01-10 0z" />
            </svg>
          </span>
          <div class="text-sm font-semibold">Liga gewinnen</div>
          <div class="mt-0.5 text-xs text-white/60">Edge wöchentlich tracken.</div>
        </div>
      </div>
    </section>

    <!-- Login column -->
    <section class="relative flex justify-center lg:justify-end">
      <!-- Desktop watermark badge -->
      <div class="pointer-events-none absolute -right-20 -top-20 hidden h-72 w-72 opacity-30 lg:block">
        <KickwiseLogo variant="badge" class="h-full w-full" />
      </div>

      <form
        class="relative w-full max-w-md space-y-5 rounded-3xl border border-white/15 bg-white/10 p-7 shadow-[0_30px_80px_rgba(7,18,38,0.4)] backdrop-blur-xl"
        onsubmit={handleSubmit}
      >
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.18em] text-[#23C6D1]">
            Anmelden
          </div>
          <h2 class="font-display text-2xl font-bold leading-tight">Willkommen zurück</h2>
          <p class="mt-1 text-sm text-white/70">
            Mit deinen Kickbase-Zugangsdaten. Kickwise speichert keine Passwörter — nur den
            Kickbase-Token für die Session.
          </p>
        </div>

        <div class="space-y-3">
          <label for="email" class="block">
            <span class="mb-1.5 block text-xs font-semibold text-white/80">E-Mail</span>
            <input
              id="email"
              type="email"
              bind:value={email}
              required
              autocomplete="email"
              placeholder="max@example.com"
              class="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#23C6D1] focus:outline-none focus:ring-2 focus:ring-[#23C6D1]/40"
            />
          </label>
          <label for="password" class="block">
            <span class="mb-1.5 block text-xs font-semibold text-white/80">Passwort</span>
            <input
              id="password"
              type="password"
              bind:value={password}
              required
              autocomplete="current-password"
              class="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#23C6D1] focus:outline-none focus:ring-2 focus:ring-[#23C6D1]/40"
            />
          </label>
        </div>

        {#if errorMessage}
          <p
            class="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
          >
            {errorMessage}
          </p>
        {/if}

        <button
          type="submit"
          disabled={submitting || !email || !password}
          class="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#113A78] shadow-[0_8px_24px_rgba(35,198,209,0.25)] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {#if submitting}
            <span
              class="inline-block size-3 animate-spin rounded-full border-2 border-current border-t-transparent"
            ></span>
            Anmelden …
          {:else}
            <span class="inline-flex h-5 w-5 items-center justify-center rounded bg-[#113A78] text-[11px] font-bold text-white">K</span>
            Mit Kickbase anmelden
          {/if}
        </button>

        <p class="text-center text-[11px] leading-relaxed text-white/50">
          Mit der Anmeldung stimmst du den <u>Nutzungsbedingungen</u> &amp;
          <u>Datenschutzhinweisen</u> zu.<br />Kickwise ist nicht mit Kickbase GmbH affiliiert.
        </p>
      </form>
    </section>
  </div>
</div>
