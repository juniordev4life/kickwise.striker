<script>
import "../app.css";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import Spinner from "$components/common/Spinner.svelte";
import TopNav from "$components/layout/TopNav.svelte";
import { authStore } from "$stores/auth.stores.js";

let { children } = $props();

const publicRoutes = ["/login"];

$effect(() => {
  authStore.refresh();
});

$effect(() => {
  if (authStore.isLoading) return;
  const isPublic = publicRoutes.some((p) => page.url.pathname.startsWith(p));
  if (!authStore.isAuthenticated && !isPublic) {
    goto("/login");
  }
});
</script>

<TopNav />

<main class="mx-auto max-w-5xl px-4 py-6">
  {#if authStore.isLoading}
    <Spinner label="Lade Session …" />
  {:else}
    {@render children?.()}
  {/if}
</main>
