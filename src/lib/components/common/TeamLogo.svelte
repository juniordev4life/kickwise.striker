<script>
let { src, alt, size = 32 } = $props();
</script>

{#if src}
  <img {src} {alt} width={size} height={size} class="rounded-full bg-white object-contain p-0.5" loading="lazy" />
{:else}
  <span
    class="inline-flex items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-500"
    style="width: {size}px; height: {size}px"
    aria-label={alt}
  >
    {alt?.slice(0, 2)?.toUpperCase() ?? "?"}
  </span>
{/if}
