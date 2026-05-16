<script>
let { size = "md", label = "Lädt …" } = $props();
const sizes = { sm: "size-4", md: "size-6", lg: "size-10" };
</script>

<div class="flex flex-col items-center justify-center gap-2 py-4" role="status" aria-live="polite">
  <span
    class="inline-block animate-spin rounded-full border-2 border-accent border-t-transparent {sizes[size]}"
    aria-hidden="true"
  ></span>
  <span class="text-xs text-muted">{label}</span>
</div>
