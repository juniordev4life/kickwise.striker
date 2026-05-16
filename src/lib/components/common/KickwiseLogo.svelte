<!--
  Kickwise brand mark.

  Two variants:
  - "mark"  → compact circular badge with hex-faceted ball + cyan arrow swoosh. Use ≤48 px.
  - "badge" → detailed crest with gold double-ring, three player silhouettes, full ball + arrow.
              Use at hero sizes (≥80 px) — splash, profile, marketing surfaces.

  @example
    <KickwiseLogo variant="mark" class="w-9 h-9" />
    <KickwiseLogo variant="badge" class="w-28 h-28" />
-->
<script>
let { variant = "mark", class: className = "", ...rest } = $props();
</script>

{#if variant === "badge"}
  <svg
    viewBox="0 0 100 100"
    class={className}
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    <defs>
      <linearGradient id="kw-badge-arrow" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stop-color="#113A78" />
        <stop offset="55%" stop-color="#2A9EDF" />
        <stop offset="100%" stop-color="#23C6D1" />
      </linearGradient>
    </defs>
    <!-- Double frame: gold outer + blue inner -->
    <circle cx="50" cy="50" r="48" fill="#FAF6F2" stroke="#C9A64B" stroke-width="1" />
    <circle cx="50" cy="50" r="45" fill="none" stroke="#113A78" stroke-width="1.6" opacity="0.9" />
    <!-- Three player silhouettes -->
    <g opacity="0.85">
      <circle cx="40" cy="22" r="3" fill="#113A78" />
      <path d="M34.5 31 Q40 24 45.5 31 L45.5 34 L34.5 34 Z" fill="#113A78" />
      <circle cx="50" cy="19" r="3.2" fill="#2A9EDF" />
      <path d="M44 28 Q50 21 56 28 L56 32 L44 32 Z" fill="#2A9EDF" />
      <circle cx="60" cy="22" r="3" fill="#23C6D1" />
      <path d="M54.5 31 Q60 24 65.5 31 L65.5 34 L54.5 34 Z" fill="#23C6D1" />
    </g>
    <!-- Hex-faceted football -->
    <g transform="translate(34 54)">
      <circle r="17" fill="#0a2553" />
      <polygon points="0,-7 6,-3.5 6,3.5 0,7 -6,3.5 -6,-3.5" fill="#23C6D1" />
      <polygon points="-9,-10 -3,-8 -2,-2 -9,-3 -12,-6 -11,-9" fill="#2A9EDF" />
      <polygon points="9,-10 13,-7 12,-1 6,-2 0,-6 3,-9" fill="#C9A64B" />
      <polygon points="-10,4 -5,2 -1,7 -4,12 -9,12 -12,8" fill="#2A9EDF" />
      <polygon points="10,5 13,9 11,13 5,13 3,8 6,4" fill="#1a4d8e" />
    </g>
    <!-- Primary upward chart-arrow -->
    <path
      d="M18 82 L38 64 L52 72 L80 24"
      stroke="url(#kw-badge-arrow)"
      stroke-width="6"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
    <path
      d="M72 17 L83 21 L78 33"
      stroke="#23C6D1"
      stroke-width="6"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
    <!-- Secondary gold whisper -->
    <path
      d="M52 78 Q66 78 78 60"
      stroke="#C9A64B"
      stroke-width="2"
      stroke-linecap="round"
      fill="none"
      opacity="0.7"
    />
    <path
      d="M75 60 L80 58 L78 64"
      stroke="#C9A64B"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
      opacity="0.7"
    />
  </svg>
{:else}
  <svg
    viewBox="0 0 32 32"
    class={className}
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    <circle cx="16" cy="16" r="14.6" fill="#113A78" />
    <circle
      cx="16"
      cy="16"
      r="14.6"
      fill="none"
      stroke="#C9A64B"
      stroke-width="0.7"
      opacity="0.7"
    />
    <!-- Hex-faceted ball hint -->
    <circle cx="11" cy="20" r="4.2" fill="#0a2553" />
    <polygon points="11,17.4 13.3,18.7 13.3,21.4 11,22.7 8.7,21.4 8.7,18.7" fill="#23C6D1" />
    <polygon
      points="8.4,17 9.6,15.2 11.5,15.4 11,17.4 9,17.6 7.6,17"
      fill="#C9A64B"
      opacity="0.9"
    />
    <!-- Upward chart-arrow -->
    <path
      d="M6.5 23 L13 18 L17 20 L24 10.2"
      stroke="#2A9EDF"
      stroke-width="2.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
    <path
      d="M20.6 8.6 L25 10.2 L23.3 14.6"
      stroke="#23C6D1"
      stroke-width="2.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
  </svg>
{/if}
