<script>
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { authStore } from "$stores/auth.stores.svelte.js";

const navItems = [
  { href: "/matchday", label: "Spieltag" },
  { href: "/table", label: "Tabelle" },
  { href: "/league", label: "Liga" },
  { href: "/squad", label: "Kader" },
  { href: "/players", label: "Spieler" }
];

async function handleLogout() {
  await authStore.logout();
  await goto("/login");
}
</script>

<header class="border-b border-slate-200 bg-white">
  <nav class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
    <a href="/" class="flex items-center gap-2 text-lg font-semibold text-[var(--color-pitch-dark)]">
      <span aria-hidden="true">⚽</span>
      Kickwise
    </a>

    {#if authStore.isAuthenticated}
      <ul class="hidden gap-1 sm:flex">
        {#each navItems as item (item.href)}
          {@const isActive = page.url.pathname.startsWith(item.href)}
          <li>
            <a
              href={item.href}
              class="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              class:bg-slate-100={isActive}
              class:text-slate-900={isActive}
            >
              {item.label}
            </a>
          </li>
        {/each}
      </ul>

      <div class="flex items-center gap-2">
        <span class="hidden text-sm text-slate-500 sm:inline">
          {authStore.currentUser?.profile?.name ?? ""}
        </span>
        <button
          type="button"
          class="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          onclick={handleLogout}
        >
          Abmelden
        </button>
      </div>
    {/if}
  </nav>
</header>
