<script>
let { title = "Etwas ist schiefgelaufen.", message, onRetry } = $props();
</script>

<div class="flex flex-col items-center gap-3 rounded-md border border-red-200 bg-red-50 p-6 text-center">
  <span class="text-2xl" aria-hidden="true">⚠</span>
  <h2 class="text-base font-semibold text-red-900">{title}</h2>
  {#if message}
    <p class="text-sm text-red-700">{message}</p>
  {/if}
  {#if onRetry}
    <button
      type="button"
      class="mt-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
      onclick={onRetry}
    >
      Erneut versuchen
    </button>
  {/if}
</div>
