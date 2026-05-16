<script>
import "../app.css";
import { goto } from "$app/navigation";
import { page } from "$app/state";
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

{#if !isPublic}
  <TopNav onToggleTheme={toggleTheme} />
  <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6">
    {#if authStore.isLoading}
      <Spinner label="Lade Session …" />
    {:else}
      {@render children?.()}
    {/if}
  </main>
{:else if authStore.isLoading}
  <div class="flex min-h-screen items-center justify-center">
    <Spinner label="Lade Session …" />
  </div>
{:else}
  {@render children?.()}
{/if}
