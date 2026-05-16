<script>
import "../app.css";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import BottomNav from "$components/layout/BottomNav.svelte";
import SideRailNav from "$components/layout/SideRailNav.svelte";
import Spinner from "$components/common/Spinner.svelte";
import TopNav from "$components/layout/TopNav.svelte";
import { authStore } from "$stores/auth.stores.svelte.js";

let { children } = $props();

const publicRoutes = ["/login"];
const isPublic = $derived(publicRoutes.some((p) => page.url.pathname.startsWith(p)));

$effect(() => {
  authStore.refresh();
});

$effect(() => {
  if (authStore.isLoading) return;
  if (!authStore.isAuthenticated && !isPublic) {
    goto("/login");
  }
});

$effect(() => {
  if (typeof window === "undefined") return;
  try {
    const saved = localStorage.getItem("kw-theme");
    if (saved) document.documentElement.setAttribute("data-theme", saved);
  } catch {
    /* localStorage unavailable, skip */
  }
});

/**
 * Toggle between light + dark themes. Persists in localStorage so the
 * preference survives reloads.
 */
function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  try {
    localStorage.setItem("kw-theme", next);
  } catch {
    /* skip */
  }
}
</script>

{#if isPublic}
  {#if authStore.isLoading}
    <div class="flex min-h-screen items-center justify-center">
      <Spinner label="Lade Session …" />
    </div>
  {:else}
    {@render children?.()}
  {/if}
{:else}
  <!--
    Authenticated shell.
    - Mobile (<md): TopNav (slim brand + theme) ─ content ─ BottomNav (5 tabs)
    - Desktop (≥md): SideRailNav + content, neither TopNav nor BottomNav visible
  -->
  <div class="md:flex md:min-h-screen md:bg-canvas">
    {#if authStore.isAuthenticated}
      <SideRailNav onToggleTheme={toggleTheme} />
    {/if}

    <div class="flex min-h-screen w-full flex-1 flex-col md:min-h-screen">
      <div class="md:hidden">
        <TopNav onToggleTheme={toggleTheme} />
      </div>

      <main
        class="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-4 sm:px-6 sm:pt-6 md:px-8 md:pb-10 md:pt-8"
      >
        {#if authStore.isLoading}
          <Spinner label="Lade Session …" />
        {:else}
          {@render children?.()}
        {/if}
      </main>

      {#if authStore.isAuthenticated}
        <BottomNav />
      {/if}
    </div>
  </div>
{/if}
