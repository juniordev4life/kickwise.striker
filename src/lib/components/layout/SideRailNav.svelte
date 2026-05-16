<!--
  Desktop side-rail navigation. Hidden on mobile (BottomNav covers that).
  Contains brand mark, primary nav items, and a footer with user identity +
  theme toggle + logout.

  @example
    <SideRailNav onToggleTheme={toggleTheme} />
-->
<script>
import { goto } from "$app/navigation";
import { page } from "$app/state";
import KickwiseLogo from "$components/common/KickwiseLogo.svelte";
import { authStore } from "$stores/auth.stores.svelte.js";

let { onToggleTheme } = $props();

const primaryItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "M3 12L12 3l9 9M5 10v10h14V10"
  },
  {
    href: "/matchday",
    label: "Spieltag",
    icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
  },
  {
    href: "/table",
    label: "Tabelle",
    icon: "M3 6h18M3 12h18M3 18h18"
  },
  {
    href: "/league",
    label: "Liga",
    icon: "M8 21h8M12 17v4M17 5h3v3a5 5 0 01-5 5h-1M7 5H4v3a5 5 0 005 5h1M7 3h10v6a5 5 0 01-10 0z"
  },
  {
    href: "/squad",
    label: "Kader",
    icon: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"
  },
  {
    href: "/players",
    label: "Spieler",
    icon: "M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z"
  }
];

/**
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

<aside
  class="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-edge bg-surface md:flex"
  aria-label="Hauptnavigation"
>
  <!-- Brand -->
  <a href="/dashboard" class="flex items-center gap-2.5 px-4 py-5 text-ink">
    <KickwiseLogo variant="mark" class="h-9 w-9" />
    <span class="font-display text-lg font-bold tracking-tight">kickwise</span>
  </a>

  <!-- Primary nav -->
  <nav class="flex-1 overflow-y-auto px-3">
    <div class="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
      Hauptmenü
    </div>
    <ul class="flex flex-col gap-0.5">
      {#each primaryItems as item (item.href)}
        {@const active = isActive(item.href)}
        <li>
          <a
            href={item.href}
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
            class:text-muted={!active}
            class:hover:bg-panel={!active}
            class:hover:text-ink={!active}
            class:bg-primary={active}
            class:text-white={active}
            class:shadow-sm={active}
            aria-current={active ? "page" : undefined}
          >
            <svg
              viewBox="0 0 24 24"
              class="h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d={item.icon} />
            </svg>
            <span>{item.label}</span>
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <!-- Footer: user + theme + logout -->
  <div class="border-t border-edge p-3">
    <div class="flex items-center gap-3 rounded-2xl bg-panel p-3">
      <div
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-semibold text-white"
      >
        {(authStore.currentUser?.profile?.name ?? "K")[0]?.toUpperCase()}
      </div>
      <div class="min-w-0 flex-1 leading-tight">
        <div class="truncate text-[13px] font-semibold text-ink">
          {authStore.currentUser?.profile?.name ?? "Spieler"}
        </div>
        <div class="text-[10px] text-muted">Pro · Kickbase verbunden</div>
      </div>
    </div>

    <div class="mt-2 flex items-center gap-2">
      <button
        type="button"
        aria-label="Theme wechseln"
        class="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-edge bg-surface text-xs font-medium text-muted transition hover:text-ink"
        onclick={onToggleTheme}
      >
        <svg
          viewBox="0 0 24 24"
          class="h-3.5 w-3.5"
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
        Theme
      </button>
      <button
        type="button"
        aria-label="Abmelden"
        class="flex h-9 w-9 items-center justify-center rounded-xl border border-edge bg-surface text-muted transition hover:bg-panel hover:text-ink"
        onclick={handleLogout}
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
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
      </button>
    </div>
  </div>
</aside>
