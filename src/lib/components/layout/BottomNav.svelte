<!--
  Mobile bottom navigation. Fixed to the viewport bottom with safe-area inset,
  shown only at < md breakpoint. Mirrors the five primary app sections.

  @example
    <BottomNav />
-->
<script>
import { page } from "$app/state";

const items = [
  {
    href: "/matchday",
    label: "Spieltag",
    icon: "M3 12L12 3l9 9M5 10v10h14V10"
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
  return href === "/matchday" ? path === "/matchday" || path.startsWith("/matchday/") : path.startsWith(href);
}
</script>

<nav
  class="fixed inset-x-0 bottom-0 z-40 border-t border-edge bg-canvas/85 backdrop-blur-md md:hidden"
  style="padding-bottom: max(0.25rem, env(safe-area-inset-bottom))"
  aria-label="Hauptnavigation"
>
  <ul class="mx-auto grid max-w-md grid-cols-5">
    {#each items as item (item.href)}
      {@const active = isActive(item.href)}
      <li>
        <a
          href={item.href}
          class="flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-medium transition"
          class:text-primary={active}
          class:text-muted={!active}
          aria-current={active ? "page" : undefined}
        >
          <span
            class="flex h-9 w-12 items-center justify-center rounded-xl transition"
            class:bg-primary={active}
            class:text-white={active}
          >
            <svg
              viewBox="0 0 24 24"
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d={item.icon} />
            </svg>
          </span>
          <span>{item.label}</span>
        </a>
      </li>
    {/each}
  </ul>
</nav>
