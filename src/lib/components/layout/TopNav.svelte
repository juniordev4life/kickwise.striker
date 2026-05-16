<script>
import { goto } from "$app/navigation";
import { page } from "$app/state";
import KickwiseLogo from "$components/common/KickwiseLogo.svelte";
import { authStore } from "$stores/auth.stores.svelte.js";

let { onToggleTheme } = $props();

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/matchday", label: "Spieltag" },
  { href: "/table", label: "Tabelle" },
  { href: "/league", label: "Liga" },
  { href: "/squad", label: "Kader" },
  { href: "/players", label: "Spieler" }
];

/**
 * Match active state against current path. `/matchday` is also active for
 * `/matchday/[matchday]` so the nav doesn't flicker when drilling into a
 * specific matchday detail view.
 *
 * @param {string} href
 * @returns {boolean}
 */
function isActive(href) {
  const path = page.url.pathname;
  if (href === "/dashboard") return path === "/dashboard" || path === "/";
  if (href === "/matchday") return path === "/matchday" || path.startsWith("/matchday/");
  return path.startsWith(href);
}

async function handleLogout() {
  await authStore.logout();
  await goto("/login");
}
</script>

<header
  class="sticky top-0 z-40 border-b border-edge bg-canvas/80 backdrop-blur-md backdrop-saturate-150"
>
  <nav class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
    <a href="/dashboard" class="flex shrink-0 items-center gap-2.5 text-ink">
      <KickwiseLogo variant="mark" class="h-9 w-9" />
      <span class="font-display text-lg font-bold tracking-tight">kickwise</span>
    </a>

    {#if authStore.isAuthenticated}
      <!-- Desktop nav (hidden on mobile, lives in BottomNav instead) -->
      <ul class="hidden gap-1 md:flex">
        {#each navItems as item (item.href)}
          {@const active = isActive(item.href)}
          <li>
            <a
              href={item.href}
              class="rounded-lg px-3 py-1.5 text-sm font-medium transition"
              class:text-muted={!active}
              class:hover:bg-panel={!active}
              class:hover:text-ink={!active}
              class:bg-primary={active}
              class:text-white={active}
              class:shadow-sm={active}
            >
              {item.label}
            </a>
          </li>
        {/each}
      </ul>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Theme wechseln"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-edge bg-surface text-muted transition hover:text-ink"
          onclick={onToggleTheme}
        >
          <svg
            viewBox="0 0 24 24"
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        </button>

        <span class="hidden text-sm font-medium text-ink lg:inline">
          {authStore.currentUser?.profile?.name ?? ""}
        </span>
        <button
          type="button"
          class="rounded-lg border border-edge bg-surface px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-panel"
          onclick={handleLogout}
        >
          <span class="hidden sm:inline">Abmelden</span>
          <svg
            viewBox="0 0 24 24"
            class="h-4 w-4 sm:hidden"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        </button>
      </div>
    {:else}
      <button
        type="button"
        aria-label="Theme wechseln"
        class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-edge bg-surface text-muted transition hover:text-ink"
        onclick={onToggleTheme}
      >
        <svg
          viewBox="0 0 24 24"
          class="h-4 w-4"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      </button>
    {/if}
  </nav>
</header>
